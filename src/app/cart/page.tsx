"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCartItems, updateCartQuantity, type CartItem } from "@/lib/cart";
import { formatMRU } from "@/lib/format";
import { ConsumerNav } from "@/components/ConsumerNav";

type LineItem = CartItem & {
  name: string;
  price_mru: number;
  imageUrl: string | null;
  stock: number;
};

export default function CartPage() {
  const router = useRouter();
  const [lines, setLines] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }
    setUserId(user.id);

    const items = await getCartItems(supabase, user.id);
    if (items.length === 0) {
      setLines([]);
      setLoading(false);
      return;
    }

    const productIds = items.map((i) => i.product_id);
    const { data: products } = await supabase
      .from("products")
      .select("id, name, price_mru, product_media(url, is_hero, type)")
      .in("id", productIds);

    const merged: LineItem[] = items.map((item) => {
      const product = products?.find((p) => p.id === item.product_id);
      const media = (product?.product_media ?? []) as Array<{
        url: string;
        is_hero: boolean | null;
        type: string;
      }>;
      const hero =
        media.find((m) => m.is_hero && m.type === "image") ??
        media.find((m) => m.type === "image");
      return {
        ...item,
        name: product?.name ?? "Unknown product",
        price_mru: product?.price_mru ?? 0,
        imageUrl: hero?.url ?? null,
        stock: 999,
      };
    });

    setLines(merged);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateQuantity(line: LineItem, quantity: number) {
    if (!userId) return;
    const supabase = createClient();
    await updateCartQuantity(
      supabase,
      userId,
      line.product_id,
      line.variant_id,
      quantity
    );
    load();
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price_mru * l.quantity, 0);

  if (loading) {
    return (
      <main className="min-h-screen bg-indigo-900">
        <ConsumerNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-indigo-900 text-sand-100">
      <ConsumerNav
        cartCount={lines.reduce((s, l) => s + l.quantity, 0)}
      />
      <div className="mx-auto max-w-2xl px-6 py-8 sm:px-10">
        <h1 className="font-display text-2xl text-sand-50">Your cart</h1>

        {lines.length === 0 ? (
          <div className="mt-10 text-center text-sand-400">
            <p>Your cart is empty.</p>
            <Link
              href="/feed"
              className="mt-3 inline-block text-sand-200 underline underline-offset-4"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-6 divide-y divide-indigo-700">
              {lines.map((line) => (
                <li
                  key={`${line.product_id}-${line.variant_id}`}
                  className="flex items-center gap-4 py-4"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-indigo-800">
                    {line.imageUrl && (
                      <Image
                        src={line.imageUrl}
                        alt={line.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/product/${line.product_id}`}
                      className="text-sm text-sand-100 hover:underline"
                    >
                      {line.name}
                    </Link>
                    <p className="text-xs text-sand-400">
                      {formatMRU(line.price_mru)}
                    </p>
                  </div>
                  <div className="flex items-center rounded border border-indigo-600">
                    <button
                      onClick={() => updateQuantity(line, line.quantity - 1)}
                      className="px-2 py-1 text-sand-300 hover:text-sand-50"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(line, line.quantity + 1)}
                      className="px-2 py-1 text-sand-300 hover:text-sand-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => updateQuantity(line, 0)}
                    className="text-xs text-sand-500 hover:text-clay-400"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t border-indigo-700 pt-4">
              <span className="text-sm text-sand-300">Subtotal</span>
              <span className="font-display text-xl text-sand-50">
                {formatMRU(subtotal)}
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block w-full rounded bg-clay-500 px-4 py-3 text-center text-sm font-medium text-sand-50 transition-colors hover:bg-clay-400"
            >
              Proceed to checkout
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
