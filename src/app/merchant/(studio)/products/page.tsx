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
    .select(
      "id, name, price_mru, view_count, purchase_count, refund_count, product_media(url, is_hero, type), inventory(quantity_available)"
    )
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false });

  const rows = (products ?? []).map((p) => {
    const media = (p.product_media ?? []) as Array<{
      url: string;
      is_hero: boolean | null;
      type: string;
    }>;
    const hero =
      media.find((m) => m.is_hero && m.type === "image") ??
      media.find((m) => m.type === "image");
    const hasVideo = media.some((m) => m.type === "video");
    const inv = (p.inventory ?? []) as Array<{ quantity_available: number | null }>;
    const stock = inv.reduce((s, i) => s + (i.quantity_available ?? 0), 0);
    return { ...p, hero, hasVideo, stock };
  });

  const outOfStock = rows.filter((r) => r.stock === 0).length;
  const lowStock = rows.filter((r) => r.stock > 0 && r.stock <= 5).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-400">{rows.length} posts</p>
        <Link
          href="/merchant/products/new"
          className="rounded-full bg-ink-50 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-ink-200"
        >
          + New post
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded border border-dashed border-ink-600 bg-ink-850 p-10 text-center text-sm text-ink-500">
          No posts yet.{" "}
          <Link href="/merchant/products/new" className="text-ink-50 underline">
            Post your first product
          </Link>
          .
        </div>
      ) : (
        <>
          {/* Desktop: stock-dashboard-style table */}
          <div className="mt-6 hidden lg:block">
            <div className="flex gap-6 rounded-lg border border-ink-700 bg-ink-850 p-4 text-sm">
              <div>
                <span className="text-ink-500">Out of stock </span>
                <span className="font-display text-lg text-ink-50">{outOfStock}</span>
              </div>
              <div>
                <span className="text-ink-500">Low stock (≤5) </span>
                <span className="font-display text-lg text-ink-50">{lowStock}</span>
              </div>
              <div>
                <span className="text-ink-500">Total products </span>
                <span className="font-display text-lg text-ink-50">{rows.length}</span>
              </div>
            </div>

            <table className="mt-4 w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-ink-500">
                  <th className="py-2 pr-4 font-medium">Product</th>
                  <th className="py-2 pr-4 font-medium">Price</th>
                  <th className="py-2 pr-4 font-medium">Stock</th>
                  <th className="py-2 pr-4 font-medium">Views</th>
                  <th className="py-2 pr-4 font-medium">Sold</th>
                  <th className="py-2 font-medium">Refunds</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-ink-800">
                    <td className="py-3 pr-4">
                      <Link href={`/product/${p.id}`} className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-ink-800">
                          {p.hero && (
                            <Image src={p.hero.url} alt="" fill sizes="40px" className="object-cover" />
                          )}
                        </div>
                        <span className="max-w-xs truncate">{p.name}</span>
                        {p.hasVideo && <span className="text-xs text-ink-500">video</span>}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{formatMRU(p.price_mru)}</td>
                    <td className="py-3 pr-4">
                      <span className={p.stock === 0 ? "text-red-400" : p.stock <= 5 ? "text-gold-500" : ""}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-ink-300">{p.view_count}</td>
                    <td className="py-3 pr-4 text-ink-300">{p.purchase_count}</td>
                    <td className="py-3 text-ink-300">{p.refund_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: thumbnail grid */}
          <div className="mt-6 grid grid-cols-3 gap-1 sm:gap-2 lg:hidden">
            {rows.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="group relative aspect-[9/16] overflow-hidden rounded bg-ink-850"
              >
                {p.hero ? (
                  <Image
                    src={p.hero.url}
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
                {p.hasVideo && (
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
            ))}
          </div>
        </>
      )}
    </div>
  );
}
