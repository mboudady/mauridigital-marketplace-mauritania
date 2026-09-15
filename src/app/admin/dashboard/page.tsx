import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { formatMRU } from "@/lib/format";

async function verifyMerchant(formData: FormData) {
  "use server";
  const merchantId = formData.get("merchantId") as string;
  const supabase = await createClient();
  await supabase
    .from("merchants")
    .update({ verification_status: "verified", verified_at: new Date().toISOString() })
    .eq("id", merchantId);
  revalidatePath("/admin/dashboard");
}

async function sendBroadcast(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const supabase = await createClient();
  await supabase.rpc("broadcast_system_notification", { p_title: title, p_body: body });
  revalidatePath("/admin/dashboard");
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const isAdmin = roles?.some((r) => r.role === "admin");

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-950 text-ink-50">
        <p className="text-sm text-ink-500">
          This account doesn&rsquo;t have admin access.
        </p>
      </main>
    );
  }

  const [{ data: merchants }, { count: userCount }, { count: orderCount }] = await Promise.all([
    supabase
      .from("merchants")
      .select("id, store_name, category, verification_status, total_gmv, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
  ]);

  const totalGmv = (merchants ?? []).reduce((s, m) => s + (m.total_gmv ?? 0), 0);

  return (
    <main className="min-h-screen bg-ink-950 px-6 py-10 text-ink-50 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl">Platform overview</h1>
          <Link href="/admin/moderation" className="text-sm text-ink-100 underline">
            Moderation queue
          </Link>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Merchants", value: merchants?.length ?? 0 },
            { label: "Users", value: userCount ?? 0 },
            { label: "Orders", value: orderCount ?? 0 },
            { label: "GMV", value: formatMRU(totalGmv) },
          ].map((s) => (
            <div key={s.label} className="rounded border border-ink-700 bg-ink-850 p-4">
              <dt className="text-xs text-ink-400">{s.label}</dt>
              <dd className="mt-1 font-display text-xl">{s.value}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-10 rounded border border-ink-700 bg-ink-850 p-5">
          <h2 className="text-sm font-medium">Send an announcement</h2>
          <p className="mt-1 text-xs text-ink-400">
            Goes to every user — customers, merchants, and affiliates alike.
          </p>
          <form action={sendBroadcast} className="mt-4 space-y-3">
            <input
              name="title"
              required
              placeholder="Title"
              className="w-full rounded border border-ink-600 bg-ink-900 px-3 py-2 text-sm focus:border-ink-100 focus:outline-none focus:ring-1 focus:ring-ink-100"
            />
            <textarea
              name="body"
              required
              rows={2}
              placeholder="Message"
              className="w-full rounded border border-ink-600 bg-ink-900 px-3 py-2 text-sm focus:border-ink-100 focus:outline-none focus:ring-1 focus:ring-ink-100"
            />
            <button
              type="submit"
              className="rounded bg-ink-50 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-ink-200"
            >
              Send to everyone
            </button>
          </form>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium">Merchants</h2>
          <table className="mt-4 w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink-600 text-ink-500">
                <th className="py-2 font-medium">Store</th>
                <th className="py-2 font-medium">Category</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">GMV</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {merchants?.map((m) => (
                <tr key={m.id} className="border-b border-ink-700">
                  <td className="py-3">{m.store_name}</td>
                  <td className="py-3 text-ink-300">{m.category}</td>
                  <td className="py-3">
                    <span
                      className={
                        m.verification_status === "verified"
                          ? "text-ink-50"
                          : "text-ink-500"
                      }
                    >
                      {m.verification_status}
                    </span>
                  </td>
                  <td className="py-3">{formatMRU(m.total_gmv ?? 0)}</td>
                  <td className="py-3 text-right">
                    {m.verification_status !== "verified" && (
                      <form action={verifyMerchant}>
                        <input type="hidden" name="merchantId" value={m.id} />
                        <button
                          type="submit"
                          className="rounded border border-ink-600 px-3 py-1 text-xs text-ink-50 hover:bg-ink-800"
                        >
                          Verify
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {!merchants?.length && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-400">
                    No merchants yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
