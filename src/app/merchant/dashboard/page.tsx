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
    <main className="min-h-screen bg-sand-50 px-6 py-12 text-indigo-900 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-indigo-400">
          {merchant.category}
        </p>
        <h1 className="mt-1 font-display text-3xl">{merchant.store_name}</h1>

        <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded border border-sand-200 bg-white p-4"
            >
              <dt className="text-xs text-sand-500">{stat.label}</dt>
              <dd className="mt-1 font-display text-xl">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex gap-3">
          <a
            href="/merchant/orders"
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-sand-50 hover:bg-indigo-500"
          >
            Manage orders
          </a>
          <a
            href="/merchant/affiliates"
            className="rounded border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            Affiliates
          </a>
          <a
            href="/merchant/analytics"
            className="rounded border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            Analytics
          </a>
          <a
            href="/merchant/messages"
            className="rounded border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            Messages
          </a>
          <a
            href="/merchant/products"
            className="rounded border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            Products
          </a>
          <a
            href="/merchant/products/new"
            className="rounded border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            Add a product
          </a>
        </div>

        <div className="mt-6 rounded border border-dashed border-sand-300 bg-white p-6 text-center text-sm text-sand-500">
          Analytics dashboards and affiliate management land later in the
          roadmap.
        </div>
      </div>
    </main>
  );
}
