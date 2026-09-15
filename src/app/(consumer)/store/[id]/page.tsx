import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FollowButton } from "@/components/FollowButton";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";

export default async function StorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, store_name, description, category, rating, rating_count, verification_status")
    .eq("id", id)
    .maybeSingle();

  if (!merchant) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_mru, category, product_media(url, is_hero, type)")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false });

  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("merchant_id", merchant.id);

  const cards: ProductCardData[] = (products ?? []).map((p) => {
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
      storeName: merchant.store_name,
    };
  });

  return (
    <main className="min-h-screen bg-ink-950 text-ink-100">
      <div className="safe-top mx-auto max-w-5xl px-6 pt-8 sm:px-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-500">
              {merchant.category}
            </p>
            <h1 className="mt-1 font-display text-2xl text-ink-50">
              {merchant.store_name}
            </h1>
            <p className="mt-1 text-sm text-ink-400">
              {followerCount ?? 0} followers
              {merchant.rating_count ? ` · ★ ${merchant.rating?.toFixed(1)}` : ""}
              {merchant.verification_status === "verified" ? " · Verified" : ""}
            </p>
          </div>
          <FollowButton merchantId={merchant.id} />
        </div>

        {merchant.description && (
          <p className="mt-4 max-w-lg text-sm text-ink-300">
            {merchant.description}
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {cards.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {cards.length === 0 && (
          <p className="mt-10 text-center text-ink-500">
            No products yet.
          </p>
        )}
      </div>
    </main>
  );
}
