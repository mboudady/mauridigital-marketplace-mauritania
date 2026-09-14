import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";

const EVENT_TYPES = [
  "video_start", "video_25_percent", "video_50_percent", "video_75_percent", "video_complete",
  "video_replay", "video_skip",
  "like", "unlike", "comment", "share", "save", "unsave",
  "follow", "unfollow",
  "product_click", "product_view",
  "add_to_cart", "remove_from_cart",
  "checkout_start", "checkout_complete",
  "purchase", "refund_requested",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

function getSessionId(): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  let id = sessionStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("session_id", id);
  }
  return id;
}

export async function logEvent(
  supabase: SupabaseClient<Database>,
  eventType: EventType,
  opts: { productId?: string; merchantId?: string; metadata?: Json } = {}
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("events").insert({
    user_id: user?.id ?? null,
    event_type: eventType,
    product_id: opts.productId ?? null,
    merchant_id: opts.merchantId ?? null,
    session_id: getSessionId(),
    metadata: opts.metadata ?? null,
  });
}
