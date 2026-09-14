import { createClient } from "@/lib/supabase/server";
import { ConsumerNav } from "@/components/ConsumerNav";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { getCartCount } from "@/lib/cart";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cartCount = user ? await getCartCount(supabase, user.id) : 0;

  let products: any[] = [];
  if (q && q.trim().length > 0) {
    const { data } = await supabase
      .from("products")
      .select(
        "id, name, price_mru, category, merchants(store_name), product_media(url, is_hero, type)"
      )
      .ilike("name", `%${q}%`)
      .limit(24);
    products = data ?? [];
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
      storeName: p.merchants?.store_name ?? "",
    };
  });

  return (
    <main className="min-h-screen bg-indigo-900">
      <ConsumerNav cartCount={cartCount} />
      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
        <form className="max-w-md">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search products…"
            autoFocus
            className="w-full rounded border border-indigo-600 bg-indigo-800 px-4 py-2.5 text-sand-50 placeholder:text-sand-500 focus:border-sand-400 focus:outline-none focus:ring-1 focus:ring-sand-400"
          />
        </form>

        {q && (
          <p className="mt-6 text-sm text-sand-400">
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
