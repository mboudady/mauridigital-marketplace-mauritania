import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMRU } from "@/lib/format";

function dayKey(d: string | Date) {
  return new Date(d).toISOString().slice(0, 10);
}

function MetricTile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-850 p-4">
      <dt className="text-xs text-ink-400">{label}</dt>
      <dd className="mt-1.5 font-display text-2xl">{value}</dd>
      {sub && <p className="mt-0.5 text-xs text-ink-500">{sub}</p>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-ink-700 bg-ink-850 p-5">
      <h2 className="text-sm font-medium text-ink-100">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
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
  const totalViews = (products ?? []).reduce((s, p) => s + (p.view_count ?? 0), 0);

  const funnel = [
    { label: "Product views", value: viewEvents ?? 0 },
    { label: "Added to cart", value: cartEvents ?? 0 },
    { label: "Purchased", value: purchaseEvents ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl">Performance</h1>
        <p className="text-xs text-ink-500">Last 30 days</p>
      </div>

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile label="GMV" value={formatMRU(gmv30)} sub="last 30 days" />
        <MetricTile label="Orders" value={orders30.length} sub="last 30 days" />
        <MetricTile label="Avg order value" value={formatMRU(avgOrderValue)} />
        <MetricTile label="Refunded orders" value={refundedCount} />
        <MetricTile label="Total views" value={totalViews.toLocaleString()} sub="all time" />
        <MetricTile label="Lifetime GMV" value={formatMRU(merchant.total_gmv ?? 0)} />
        <MetricTile label="Lifetime orders" value={merchant.total_sales ?? 0} />
        <MetricTile label="Products" value={products?.length ?? 0} />
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Sales, last 14 days">
          <div className="flex h-32 items-end gap-1.5">
            {days.map((d) => (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-ink-50"
                  style={{
                    height: `${Math.max(4, (gmvByDay[d] / maxDayGmv) * 100)}px`,
                  }}
                  title={`${d}: ${formatMRU(gmvByDay[d])}`}
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-500">
            {days[0]} → {days[days.length - 1]}
          </p>
        </Card>

        <Card title="Conversion funnel (30d)">
          <div className="space-y-3">
            {funnel.map((f) => {
              const pct = funnel[0].value ? (f.value / funnel[0].value) * 100 : 0;
              return (
                <div key={f.label}>
                  <div className="flex justify-between text-xs text-ink-400">
                    <span>{f.label}</span>
                    <span>{f.value}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-ink-800">
                    <div
                      className="h-2 rounded-full bg-ink-50"
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card title="Top products (30d revenue)">
        {topProducts.length === 0 ? (
          <p className="text-sm text-ink-500">No sales yet.</p>
        ) : (
          <ul className="divide-y divide-ink-800">
            {topProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0">
                <div>
                  <p>{p.name}</p>
                  <p className="text-xs text-ink-500">
                    {p.view_count} views · {p.purchase_count} sold
                  </p>
                </div>
                <p className="font-medium">{formatMRU(p.revenue)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
