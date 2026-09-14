import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ConsumerNav } from "@/components/ConsumerNav";
import { formatMRU } from "@/lib/format";
import { getCartCount } from "@/lib/cart";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  refunding: "Refunding",
  refunded: "Refunded",
  disputed: "Disputed",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: orders }, cartCount] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, total_mru, status, created_at, merchants(store_name)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false }),
    getCartCount(supabase, user.id),
  ]);

  return (
    <main className="min-h-screen bg-indigo-900 text-sand-100">
      <ConsumerNav cartCount={cartCount} />
      <div className="mx-auto max-w-2xl px-6 py-8 sm:px-10">
        <h1 className="font-display text-2xl text-sand-50">Your orders</h1>

        {!orders?.length ? (
          <p className="mt-10 text-center text-sand-400">No orders yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-indigo-700">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/orders/${o.id}`}
                  className="flex items-center justify-between py-4 hover:bg-indigo-800/40"
                >
                  <div>
                    <p className="text-sm text-sand-100">{o.order_number}</p>
                    <p className="text-xs text-sand-400">
                      {(o.merchants as unknown as { store_name: string } | null)
                        ?.store_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-sand-100">
                      {formatMRU(o.total_mru)}
                    </p>
                    <p className="text-xs text-sand-400">
                      {STATUS_LABEL[o.status] ?? o.status}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
