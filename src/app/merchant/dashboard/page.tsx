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
    .select("*, merchant_settings(commission_rate)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!merchant) redirect("/onboarding");

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("merchant_id", merchant.id);

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("merchant_id", merchant.id);

  const stats = [
    { label: "Products listed", value: productCount ?? 0 },
    { label: "Orders received", value: orderCount ?? 0 },
    { label: "Total GMV", value: `${merchant.total_gmv ?? 0} MRU` },
    {
      label: "Verification",
      value:
        merchant.verification_status === "unverified"
          ? "Unverified"
          : merchant.verification_status,
    },
  ];

  return (
    <main className="min-h-screen bg-ink-950 px-6 py-12 text-ink-50 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-ink-300">
          {merchant.category}
        </p>
        <h1 className="mt-1 font-display text-3xl">{merchant.store_name}</h1>

        <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded border border-ink-700 bg-ink-850 p-4"
            >
              <dt className="text-xs text-ink-500">{stat.label}</dt>
              <dd className="mt-1 font-display text-xl">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex gap-3">
          <a
            href="/merchant/orders"
            className="rounded bg-spark-500 px-4 py-2 text-sm font-medium text-ink-50 hover:bg-spark-400"
          >
            Manage orders
          </a>
          <a
            href="/merchant/affiliates"
            className="rounded border border-ink-600 px-4 py-2 text-sm font-medium text-spark-400 hover:bg-ink-800"
          >
            Affiliates
          </a>
          <a
            href="/merchant/analytics"
            className="rounded border border-ink-600 px-4 py-2 text-sm font-medium text-spark-400 hover:bg-ink-800"
          >
            Analytics
          </a>
          <a
            href="/merchant/messages"
            className="rounded border border-ink-600 px-4 py-2 text-sm font-medium text-spark-400 hover:bg-ink-800"
          >
            Messages
          </a>
          <a
            href="/merchant/products"
            className="rounded border border-ink-600 px-4 py-2 text-sm font-medium text-spark-400 hover:bg-ink-800"
          >
            Products
          </a>
          <a
            href="/merchant/products/new"
            className="rounded border border-ink-600 px-4 py-2 text-sm font-medium text-spark-400 hover:bg-ink-800"
          >
            Add a product
          </a>
        </div>

        <div className="mt-6 rounded border border-dashed border-ink-600 bg-ink-850 p-6 text-center text-sm text-ink-500">
          Your store is live. Manage everything from the links above.
        </div>
      </div>
    </main>
  );
}
