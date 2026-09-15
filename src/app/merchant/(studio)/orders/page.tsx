import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMRU } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  pending: "New",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  refunding: "Refund requested",
  refunded: "Refunded",
  disputed: "Disputed",
};

export default async function MerchantOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?role=merchant");

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!merchant) redirect("/onboarding");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total_mru, created_at")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false });

  const newCount = orders?.filter((o) => o.status === "pending").length ?? 0;
  const inProgressCount = orders?.filter((o) => ["confirmed", "shipped"].includes(o.status)).length ?? 0;
  const completedCount = orders?.filter((o) => o.status === "completed").length ?? 0;

  return (
    <div>
      <dl className="grid grid-cols-3 gap-4">
        {[
          { label: "New", value: newCount },
          { label: "In progress", value: inProgressCount },
          { label: "Completed", value: completedCount },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-ink-700 bg-ink-850 p-4">
            <dt className="text-xs text-ink-400">{s.label}</dt>
            <dd className="mt-1.5 font-display text-2xl">{s.value}</dd>
          </div>
        ))}
      </dl>

      {!orders?.length ? (
        <p className="mt-10 text-center text-ink-500">No orders yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-ink-800 rounded-lg border border-ink-700 bg-ink-850">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/merchant/orders/${o.id}`}
                className="flex items-center justify-between p-4 hover:bg-ink-950"
              >
                <div>
                  <p className="text-sm">{o.order_number}</p>
                  <p className="text-xs text-ink-500">
                    {new Date(o.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatMRU(o.total_mru)}</p>
                  <p
                    className={`text-xs ${
                      o.status === "pending"
                        ? "font-medium text-red-400"
                        : "text-ink-500"
                    }`}
                  >
                    {STATUS_LABEL[o.status] ?? o.status}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
