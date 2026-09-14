import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConsumerNav } from "@/components/ConsumerNav";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatMRU } from "@/lib/format";
import { getCartCount } from "@/lib/cart";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product } = await supabase
    .from("products")
    .select(
      "id, name, description, price_mru, category, rating, rating_count, merchant_id, product_media(url, is_hero, type, display_order), merchants(store_name, rating, verification_status)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!product) notFound();

  const cartCount = user ? await getCartCount(supabase, user.id) : 0;

  const images = ((product.product_media ?? []) as Array<{
    url: string;
    is_hero: boolean | null;
    type: string;
    display_order: number;
  }>)
    .filter((m) => m.type === "image")
    .sort((a, b) => a.display_order - b.display_order);

  const merchant = product.merchants as unknown as {
    store_name: string;
    rating: number | null;
    verification_status: string | null;
  } | null;

  return (
    <main className="min-h-screen bg-indigo-900 text-sand-100">
      <ConsumerNav cartCount={cartCount} />
      <div className="mx-auto grid max-w-4xl gap-8 px-6 py-8 sm:grid-cols-2 sm:px-10">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded bg-indigo-800">
            {images[0] ? (
              <Image
                src={images[0].url}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-sand-500">
                No image yet
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((img) => (
                <div
                  key={img.url}
                  className="relative aspect-square overflow-hidden rounded bg-indigo-800"
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-sand-500">
            {product.category}
          </p>
          <h1 className="mt-1 font-display text-2xl text-sand-50">
            {product.name}
          </h1>
          <p className="mt-2 font-display text-xl text-sand-100">
            {formatMRU(product.price_mru)}
          </p>

          {merchant && (
            <div className="mt-4 flex items-center gap-2 border-y border-indigo-700 py-3 text-sm">
              <span className="text-sand-200">{merchant.store_name}</span>
              {merchant.verification_status === "verified" && (
                <span className="rounded bg-indigo-700 px-2 py-0.5 text-xs text-sand-300">
                  Verified
                </span>
              )}
              {product.rating_count && product.rating_count > 0 ? (
                <span className="text-sand-400">
                  ★ {product.rating?.toFixed(1)} ({product.rating_count})
                </span>
              ) : (
                <span className="text-sand-500">No reviews yet</span>
              )}
            </div>
          )}

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-sand-300">
              {product.description}
            </p>
          )}

          <div className="mt-6">
            <AddToCartButton productId={product.id} />
          </div>

          <Link
            href="/feed"
            className="mt-6 inline-block text-xs text-sand-500 hover:text-sand-300"
          >
            ← Back to feed
          </Link>
        </div>
      </div>
    </main>
  );
}
