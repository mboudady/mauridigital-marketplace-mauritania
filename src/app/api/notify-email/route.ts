import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { GoogleAuth } from "google-auth-library";
import type { Database } from "@/types/database";

// Notification types worth an email — not every like/comment, but anything
// that needs a response or represents money moving.
const EMAILABLE_TYPES = new Set([
  "order_confirmed",
  "order_shipped",
  "order_delivered",
  "order_cancelled",
  "refund_requested",
  "refund_approved",
  "refund_rejected",
  "affiliate_commission",
  "affiliate_payout",
  "system_announcement",
]);

// Sends a push notification via FCM's HTTP v1 API. No-ops (returns
// immediately) unless a Firebase service account is configured — this
// mirrors the Bunny video pattern: infrastructure is wired and ready, it
// just needs real credentials from a Firebase project the founder creates.
async function sendPush(supabase: ReturnType<typeof createServiceClient<Database>>, userId: string, title: string, body: string): Promise<string> {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!serviceAccountJson || !projectId) return "firebase_not_configured";

  const { data: tokens } = await supabase.from("push_tokens").select("token").eq("user_id", userId);
  if (!tokens?.length) return "no_tokens";

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(serviceAccountJson);
  } catch {
    console.error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON");
    return "invalid_credentials";
  }

  const auth = new GoogleAuth({
    credentials: credentials as never,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });
  const client = await auth.getClient();
  const accessToken = (await client.getAccessToken()).token;

  await Promise.all(
    tokens.map((t) =>
      fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: t.token,
            notification: { title, body },
          },
        }),
      }).catch((err) => console.error("FCM send error:", err))
    )
  );
  return "sent";
}

// Sends the actual email via Resend. No-ops unless RESEND_API_KEY is
// configured — same gated pattern as Bunny video and FCM push below.
async function sendEmail(
  supabase: ReturnType<typeof createServiceClient<Database>>,
  record: { user_id: string; title: string; body: string | null }
): Promise<string> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return "resend_not_configured";

  const [{ data: user }, { data: settings }] = await Promise.all([
    supabase.from("users").select("email").eq("id", record.user_id).maybeSingle(),
    supabase.from("user_settings").select("email_notifications_enabled").eq("user_id", record.user_id).maybeSingle(),
  ]);

  if (!user?.email || settings?.email_notifications_enabled === false) {
    return "no_email_or_opted_out";
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Souq <notifications@souq.mr>",
        to: user.email,
        subject: record.title,
        text: record.body ?? record.title,
      }),
    });
    if (!res.ok) {
      console.error("Resend send failed:", await res.text());
      return "send_failed";
    }
    return "sent";
  } catch (err) {
    console.error("Email send error:", err);
    return "send_failed";
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.NOTIFY_WEBHOOK_SECRET;

  // Always verify the caller — no reason to let an unverified caller probe
  // this endpoint, even on requests we'd otherwise no-op on.
  if (!webhookSecret || request.headers.get("x-webhook-secret") !== webhookSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { record } = await request.json();
  if (!record || !EMAILABLE_TYPES.has(record.type)) {
    return NextResponse.json({ skipped: true });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Supabase service role not configured" }, { status: 500 });
  }
  const supabase = createServiceClient<Database>(supabaseUrl, serviceRoleKey);

  const results: Record<string, unknown> = {};

  // Push and email are independent — one being unconfigured shouldn't skip
  // the other.
  await Promise.all([
    sendPush(supabase, record.user_id, record.title, record.body ?? record.title).then(
      (r) => (results.push = r)
    ),
    sendEmail(supabase, record).then((r) => (results.email = r)),
  ]);

  return NextResponse.json(results);
}
