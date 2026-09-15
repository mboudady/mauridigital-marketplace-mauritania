"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";

export default function SavedPage() {
  const router = useRouter();
  const [cards, setCards] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

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

      const { data: saves } = await supabase
        .from("saves")
        .select(
          "product_id, products(id, name, price_mru, category, merchants(store_name), product_media(url, is_hero, type))"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const mapped: ProductCardData[] = (saves ?? [])
        .map((s) => s.products)
        .filter((p): p is NonNullable<typeof p> => !!p)
        .map((p: any) => {
          const media = (p.product_media ?? []) as Array<{
            url: string;
            is_hero: boolean | null;
            type: string;
          }>;
          const hero =
            media.find((m) => m.is_hero && m.type === "image") ??
            media.find((m) => m.type === "image");
          return {
            id: p.id,
            name: p.name,
            price_mru: p.price_mru,
            category: p.category,
            heroImageUrl: hero?.url ?? null,
            hasVideo: media.some((m) => m.type === "video"),
            storeName: p.merchants?.store_name ?? "",
          };
        });

      setCards(mapped);
      setLoading(false);
    })();
  }, [router]);

  return (
    <main className="min-h-screen bg-ink-950 text-ink-100">
      <div className="safe-top mx-auto max-w-5xl px-6 pt-6 sm:px-10">
        <h1 className="font-display text-2xl text-ink-50">Saved</h1>

        {!loading && cards.length === 0 && (
          <p className="mt-10 text-center text-ink-400">
            Nothing saved yet.
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {cards.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
