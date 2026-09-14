import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OrderActions } from "@/components/OrderActions";
import { ReviewForm } from "@/components/ReviewForm";
import { formatMRU } from "@/lib/format";

const STEPS = ["pending", "confirmed", "shipped", "delivered", "completed"];

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, total_mru, merchant_id, delivery_address, delivery_city, delivery_phone, created_at, merchants(store_name), order_items(quantity, price_per_unit_mru, total_mru, product_id, products(name))"
    )
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!order) notFound();

  const currentStepIndex = STEPS.indexOf(order.status);

  let reviewedProductIds: string[] = [];
  if (order.status === "completed") {
    const { data: existingReviews } = await supabase
      .from("reviews")
      .select("product_id")
      .eq("order_id", order.id);
    reviewedProductIds = (existingReviews ?? []).map((r) => r.product_id);
  }

  return (
    <main className="min-h-screen bg-indigo-900 pb-24 text-sand-100">
      <div className="safe-top mx-auto max-w-2xl px-6 pt-6 sm:px-10">
        {placed === "1" && (
          <div className="mb-6 rounded border border-indigo-600 bg-indigo-800 p-4 text-sm text-sand-200">
            Order placed! You&rsquo;ll pay {formatMRU(order.total_mru)} in
            cash on delivery.
          </div>
        )}

        <p className="text-xs uppercase tracking-widest text-sand-500">
          {(order.merchants as unknown as { store_name: string } | null)
            ?.store_name}
        </p>
        <h1 className="mt-1 font-display text-2xl text-sand-50">
          {order.order_number}
        </h1>

        {currentStepIndex >= 0 && (
          <div className="mt-6 flex items-center gap-1">
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-1 items-center">
                <div
                  className={`h-1.5 flex-1 rounded ${
                    i <= currentStepIndex ? "bg-clay-500" : "bg-indigo-700"
                  }`}
                />
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs capitalize text-sand-400">
          {order.status}
        </p>

        <ul className="mt-6 divide-y divide-indigo-700 border-y border-indigo-700">
          {(order.order_items ?? []).map((item, i) => (
            <li key={i} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-sand-100">
                  {(item.products as unknown as { name: string } | null)
                    ?.name}
                </p>
                <p className="text-xs text-sand-400">
                  {item.quantity} × {formatMRU(item.price_per_unit_mru)}
                </p>
              </div>
              <p className="text-sm text-sand-100">
                {formatMRU(item.total_mru)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-sand-300">Total (cash on delivery)</span>
          <span className="font-display text-lg text-sand-50">
            {formatMRU(order.total_mru)}
          </span>
        </div>

        <div className="mt-6 rounded border border-indigo-700 bg-indigo-800 p-4 text-sm text-sand-300">
          <p className="text-sand-100">Delivery details</p>
          <p className="mt-1">{order.delivery_address}</p>
          <p>{order.delivery_city}</p>
          <p>{order.delivery_phone}</p>
        </div>

        <OrderActions orderId={order.id} status={order.status} />

        {order.status === "completed" && (
          <div className="mt-6 space-y-4">
            {(order.order_items ?? [])
              .filter((item) => !reviewedProductIds.includes(item.product_id))
              .map((item) => (
                <div key={item.product_id}>
                  <p className="mb-2 text-sm text-sand-300">
                    Review{" "}
                    {(item.products as unknown as { name: string } | null)?.name}
                  </p>
                  <ReviewForm
                    orderId={order.id}
                    productId={item.product_id}
                    merchantId={order.merchant_id}
                  />
                </div>
              ))}
          </div>
        )}

        <Link
          href="/orders"
          className="mt-6 inline-block text-xs text-sand-500 hover:text-sand-300"
        >
          ← All orders
        </Link>
      </div>
    </main>
  );
}
