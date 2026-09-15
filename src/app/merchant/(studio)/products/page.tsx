import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatMRU } from "@/lib/format";

export default async function MerchantProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?role=merchant");

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!merchant) redirect("/onboarding");

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_mru, view_count, purchase_count, product_media(url, is_hero, type)")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-400">{products?.length ?? 0} posts</p>
        <Link
          href="/merchant/products/new"
          className="rounded-full bg-ink-50 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-ink-200"
        >
          + New post
        </Link>
      </div>

      {!products?.length ? (
        <div className="mt-10 rounded border border-dashed border-ink-600 bg-ink-850 p-10 text-center text-sm text-ink-500">
          No posts yet.{" "}
          <Link href="/merchant/products/new" className="text-ink-50 underline">
            Post your first product
          </Link>
          .
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-1 sm:gap-2">
          {products.map((p) => {
            const media = (p.product_media ?? []) as Array<{
              url: string;
              is_hero: boolean | null;
              type: string;
            }>;
            const hero =
              media.find((m) => m.is_hero && m.type === "image") ??
              media.find((m) => m.type === "image");
            const hasVideo = media.some((m) => m.type === "video");
            return (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="group relative aspect-[9/16] overflow-hidden rounded bg-ink-850"
              >
                {hero ? (
                  <Image
                    src={hero.url}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 33vw, 200px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-ink-500">
                    No image
                  </div>
                )}
                {hasVideo && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white">
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
                      <path d="M1 0.5L9 5L1 9.5V0.5Z" />
                    </svg>
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                  <p className="truncate text-[11px] text-white">{p.name}</p>
                  <p className="text-[10px] text-white/70">
                    {formatMRU(p.price_mru)} · {p.purchase_count} sold
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
