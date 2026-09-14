import { createClient } from "@/lib/supabase/server";
import { ConsumerNav } from "@/components/ConsumerNav";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { getCartCount } from "@/lib/cart";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: products }, cartCount] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, price_mru, category, purchase_count, like_count, created_at, merchants(store_name), product_media(url, is_hero, type)"
      )
      .order("purchase_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(24),
    user ? getCartCount(supabase, user.id) : Promise.resolve(0),
  ]);

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
      storeName: (p.merchants as unknown as { store_name: string } | null)
        ?.store_name ?? "",
    };
  });

  return (
    <main className="min-h-screen bg-indigo-900">
      <ConsumerNav cartCount={cartCount} />
      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
        <p className="text-xs uppercase tracking-widest text-sand-500">
          Trending &amp; new
        </p>
        <h1 className="mt-1 font-display text-2xl text-sand-50">
          Discover products
        </h1>
        <p className="mt-1 text-sm text-sand-400">
          Video feed is coming — for now, browse what merchants have listed.
        </p>

        {cards.length === 0 ? (
          <div className="mt-16 text-center text-sand-400">
            <p>No products yet. Check back soon, or open a store yourself.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {cards.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
