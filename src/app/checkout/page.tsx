"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCartItems } from "@/lib/cart";
import { formatMRU } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const [subtotal, setSubtotal] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Nouakchott");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "placing" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const items = await getCartItems(supabase, user.id);
      if (items.length === 0) {
        router.push("/cart");
        return;
      }
      const productIds = items.map((i) => i.product_id);
      const { data: products } = await supabase
        .from("products")
        .select("id, price_mru")
        .in("id", productIds);
      const total = items.reduce((sum, item) => {
        const p = products?.find((pr) => pr.id === item.product_id);
        return sum + (p?.price_mru ?? 0) * item.quantity;
      }, 0);
      setSubtotal(total);
    })();
  }, [router]);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setStatus("placing");
    setErrorMessage("");

    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_orders_from_cart", {
      p_delivery_address: address,
      p_delivery_city: city,
      p_delivery_phone: phone,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    const firstOrderId = data?.[0]?.order_id;
    router.push(firstOrderId ? `/orders/${firstOrderId}?placed=1` : "/orders");
  }

  return (
    <main className="min-h-screen bg-sand-50 px-6 py-12 text-indigo-900">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl">Checkout</h1>
        <p className="mt-2 text-sm text-indigo-500">
          Pay cash when your order is delivered.
        </p>

        <form onSubmit={handlePlaceOrder} className="mt-8 space-y-5">
          <div>
            <label htmlFor="address" className="text-sm font-medium">
              Delivery address
            </label>
            <textarea
              id="address"
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, neighborhood, landmark"
              className="mt-1 w-full rounded border border-sand-300 bg-white px-3 py-2 text-indigo-900 placeholder:text-sand-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label htmlFor="city" className="text-sm font-medium">
              City
            </label>
            <input
              id="city"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded border border-sand-300 bg-white px-3 py-2 text-indigo-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label htmlFor="phone" className="text-sm font-medium">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+222 …"
              className="mt-1 w-full rounded border border-sand-300 bg-white px-3 py-2 text-indigo-900 placeholder:text-sand-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div className="rounded border border-sand-200 bg-white p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-sand-500">Payment method</span>
              <span className="font-medium">Cash on delivery</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-sand-100 pt-2">
              <span className="text-sand-500">Total</span>
              <span className="font-display text-lg">
                {subtotal !== null ? formatMRU(subtotal) : "…"}
              </span>
            </div>
          </div>

          {status === "error" && (
            <p className="text-sm text-clay-500">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "placing" || subtotal === null}
            className="w-full rounded bg-indigo-600 px-4 py-2.5 text-sm font-medium text-sand-50 transition-colors hover:bg-indigo-500 disabled:opacity-60"
          >
            {status === "placing" ? "Placing order…" : "Place order"}
          </button>
        </form>
      </div>
    </main>
  );
}
