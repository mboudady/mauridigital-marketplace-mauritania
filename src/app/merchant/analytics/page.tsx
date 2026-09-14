import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMRU } from "@/lib/format";

function dayKey(d: string | Date) {
  return new Date(d).toISOString().slice(0, 10);
}

export default async function MerchantAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?role=merchant");

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, store_name, total_gmv, total_sales")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!merchant) redirect("/onboarding");

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: products },
    { data: orders },
    { data: orderItems },
    { count: viewEvents },
    { count: cartEvents },
    { count: purchaseEvents },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, view_count, click_count, like_count, purchase_count, refund_count")
      .eq("merchant_id", merchant.id)
      .order("purchase_count", { ascending: false }),
    supabase
      .from("orders")
      .select("id, total_mru, status, created_at")
      .eq("merchant_id", merchant.id)
      .gte("created_at", since30)
      .order("created_at", { ascending: true }),
    supabase
      .from("order_items")
      .select("product_id, total_mru, quantity, orders!inner(merchant_id)")
      .eq("orders.merchant_id", merchant.id),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("merchant_id", merchant.id)
      .eq("event_type", "product_view")
      .gte("created_at", since30),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("merchant_id", merchant.id)
      .eq("event_type", "add_to_cart")
      .gte("created_at", since30),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("merchant_id", merchant.id)
      .eq("event_type", "purchase")
      .gte("created_at", since30),
  ]);

  // Sales trend (last 14 days)
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    days.push(dayKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000)));
  }
  const gmvByDay: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));
  (orders ?? []).forEach((o) => {
    const k = dayKey(o.created_at);
    if (k in gmvByDay) gmvByDay[k] += o.total_mru;
  });
  const maxDayGmv = Math.max(1, ...Object.values(gmvByDay));

  // Top products by revenue
  const revenueByProduct = new Map<string, number>();
  (orderItems ?? []).forEach((item: any) => {
    revenueByProduct.set(
      item.product_id,
      (revenueByProduct.get(item.product_id) ?? 0) + item.total_mru
    );
  });
  const topProducts = (products ?? [])
    .map((p) => ({ ...p, revenue: revenueByProduct.get(p.id) ?? 0 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const orders30 = orders ?? [];
  const gmv30 = orders30.reduce((s, o) => s + o.total_mru, 0);
  const avgOrderValue = orders30.length ? Math.round(gmv30 / orders30.length) : 0;
  const refundedCount = orders30.filter((o) => o.status === "refunded").length;

  const funnel = [
    { label: "Product views", value: viewEvents ?? 0 },
    { label: "Added to cart", value: cartEvents ?? 0 },
    { label: "Purchased", value: purchaseEvents ?? 0 },
  ];

  return (
    <main className="min-h-screen bg-sand-50 px-6 py-12 text-indigo-900 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-sand-500">Last 30 days</p>

        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "GMV (30d)", value: formatMRU(gmv30) },
            { label: "Orders (30d)", value: orders30.length },
            { label: "Avg order value", value: formatMRU(avgOrderValue) },
            { label: "Refunded", value: refundedCount },
          ].map((s) => (
            <div key={s.label} className="rounded border border-sand-200 bg-white p-4">
              <dt className="text-xs text-sand-500">{s.label}</dt>
              <dd className="mt-1 font-display text-xl">{s.value}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-10">
          <h2 className="text-sm font-medium text-sand-700">Sales, last 14 days</h2>
          <div className="mt-3 flex h-32 items-end gap-1 rounded border border-sand-200 bg-white p-4">
            {days.map((d) => (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-indigo-500"
                  style={{
                    height: `${Math.max(4, (gmvByDay[d] / maxDayGmv) * 96)}px`,
                  }}
                  title={`${d}: ${formatMRU(gmvByDay[d])}`}
                />
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-sand-400">
            {days[0]} → {days[days.length - 1]}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium text-sand-700">
            Conversion funnel (30d)
          </h2>
          <div className="mt-3 space-y-2 rounded border border-sand-200 bg-white p-4">
            {funnel.map((f, i) => {
              const pct = funnel[0].value ? (f.value / funnel[0].value) * 100 : 0;
              return (
                <div key={f.label}>
                  <div className="flex justify-between text-xs text-sand-500">
                    <span>{f.label}</span>
                    <span>{f.value}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-sand-100">
                    <div
                      className="h-2 rounded-full bg-clay-500"
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium text-sand-700">Top products (30d revenue)</h2>
          <ul className="mt-3 divide-y divide-sand-200 rounded border border-sand-200 bg-white">
            {topProducts.length === 0 && (
              <li className="p-4 text-sm text-sand-400">No sales yet.</li>
            )}
            {topProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p>{p.name}</p>
                  <p className="text-xs text-sand-500">
                    {p.view_count} views · {p.purchase_count} sold
                  </p>
                </div>
                <p className="font-medium">{formatMRU(p.revenue)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
