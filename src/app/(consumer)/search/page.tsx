import { createClient } from "@/lib/supabase/server";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let products: any[] = [];
  if (q && q.trim().length > 0) {
    const trimmed = q.trim();
    if (trimmed.startsWith("#")) {
      const tag = trimmed.slice(1).toLowerCase();
      const { data: hashtagRow } = await supabase
        .from("hashtags")
        .select("id")
        .eq("tag", tag)
        .maybeSingle();

      if (hashtagRow) {
        const { data } = await supabase
          .from("products")
          .select(
            "id, name, price_mru, category, merchants(store_name), product_media(url, is_hero, type), product_hashtags!inner(hashtag_id)"
          )
          .eq("product_hashtags.hashtag_id", hashtagRow.id)
          .limit(24);
        products = data ?? [];
      }
    } else {
      const { data } = await supabase
        .from("products")
        .select(
          "id, name, price_mru, category, merchants(store_name), product_media(url, is_hero, type)"
        )
        .ilike("name", `%${trimmed}%`)
        .limit(24);
      products = data ?? [];
    }
  }

  const cards: ProductCardData[] = products.map((p) => {
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

  return (
    <main className="min-h-screen bg-ink-950">
      <div className="safe-top mx-auto max-w-5xl px-6 pt-6 sm:px-10">
        <form className="max-w-md">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search products…"
            autoFocus
            className="w-full rounded border border-ink-600 bg-ink-850 px-4 py-2.5 text-ink-50 placeholder:text-ink-500 focus:border-spark-500 focus:outline-none focus:ring-1 focus:ring-spark-500"
          />
        </form>

        {q && (
          <p className="mt-6 text-sm text-ink-400">
            {cards.length} result{cards.length === 1 ? "" : "s"} for &ldquo;
            {q}&rdquo;
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {cards.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
