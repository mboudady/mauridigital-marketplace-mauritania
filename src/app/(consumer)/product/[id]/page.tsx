import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ReportButton } from "@/components/ReportButton";
import { SaveButton } from "@/components/SaveButton";
import { MessageSellerButton } from "@/components/MessageSellerButton";
import { ViewTracker } from "@/components/ViewTracker";
import { formatMRU } from "@/lib/format";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      "id, name, description, price_mru, category, rating, rating_count, merchant_id, product_media(url, is_hero, type, display_order, video_provider), merchants(store_name, rating, verification_status)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!product) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating_product, text, created_at, verified_purchase")
    .eq("product_id", product.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(20);

  const allMedia = (product.product_media ?? []) as Array<{
    url: string;
    is_hero: boolean | null;
    type: string;
    display_order: number;
    video_provider: string | null;
  }>;
  const video = allMedia.find((m) => m.type === "video");
  const images = allMedia
    .filter((m) => m.type === "image")
    .sort((a, b) => a.display_order - b.display_order);

  const merchant = product.merchants as unknown as {
    store_name: string;
    rating: number | null;
    verification_status: string | null;
  } | null;

  return (
    <main className="min-h-screen bg-indigo-900 pb-24 text-sand-100">
      <ViewTracker productId={product.id} merchantId={product.merchant_id} />
      <div className="safe-top mx-auto grid max-w-4xl gap-8 px-6 pt-6 sm:grid-cols-2 sm:px-10">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded bg-indigo-800">
            {video ? (
              <iframe
                src={video.url}
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : images[0] ? (
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
          {images.length > (video ? 0 : 1) && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.slice(video ? 0 : 1, video ? 4 : 5).map((img) => (
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
              <Link href={`/store/${product.merchant_id}`} className="text-sand-200 hover:underline">
                {merchant.store_name}
              </Link>
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

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1">
              <AddToCartButton productId={product.id} merchantId={product.merchant_id} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <SaveButton productId={product.id} />
            <MessageSellerButton merchantId={product.merchant_id} productId={product.id} />
          </div>

          <Link
            href="/feed"
            className="mt-6 inline-block text-xs text-sand-500 hover:text-sand-300"
          >
            ← Back to feed
          </Link>

          <div className="mt-4">
            <ReportButton contentType="product" contentId={product.id} />
          </div>

          {reviews && reviews.length > 0 && (
            <div className="mt-8 border-t border-indigo-700 pt-4">
              <p className="text-sm font-medium text-sand-100">Reviews</p>
              <ul className="mt-3 space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-clay-400">
                        {"★".repeat(r.rating_product)}
                        {"☆".repeat(5 - r.rating_product)}
                      </span>
                      {r.verified_purchase && (
                        <span className="text-[10px] text-sand-500">
                          Verified purchase
                        </span>
                      )}
                    </div>
                    {r.text && <p className="mt-1 text-sand-300">{r.text}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
