import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MerchantDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?role=merchant");

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, category, description")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!merchant) redirect("/onboarding");

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, order_number, status, total_mru, created_at")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-400">{merchant.category}</p>
      {merchant.description && (
        <p className="mt-1 text-sm text-ink-300">{merchant.description}</p>
      )}

      <a
        href="/merchant/products/new"
        className="mt-6 block rounded border border-dashed border-ink-600 p-4 text-center text-sm text-ink-300"
      >
        + Post a new product
      </a>

      <h2 className="mt-8 text-sm font-medium text-ink-300">Recent orders</h2>
      {!recentOrders?.length ? (
        <p className="mt-3 text-sm text-ink-500">No orders yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink-800 rounded border border-ink-800">
          {recentOrders.map((o) => (
            <li key={o.id} className="flex items-center justify-between p-3 text-sm">
              <span>{o.order_number}</span>
              <span className="text-ink-400">{o.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
