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
    .select("id, store_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!merchant) redirect("/onboarding");

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_mru, view_count, purchase_count, product_media(url, is_hero, type)")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-sand-50 px-6 py-12 text-indigo-900 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl">Products</h1>
          <Link
            href="/merchant/products/new"
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-sand-50 hover:bg-indigo-500"
          >
            Add product
          </Link>
        </div>

        {!products?.length ? (
          <div className="mt-10 rounded border border-dashed border-sand-300 bg-white p-8 text-center text-sm text-sand-500">
            No products yet.{" "}
            <Link href="/merchant/products/new" className="underline">
              Add your first one
            </Link>
            .
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-sand-200 rounded border border-sand-200 bg-white">
            {products.map((p) => {
              const media = (p.product_media ?? []) as Array<{
                url: string;
                is_hero: boolean | null;
                type: string;
              }>;
              const hero =
                media.find((m) => m.is_hero && m.type === "image") ??
                media.find((m) => m.type === "image");
              return (
                <li key={p.id} className="flex items-center gap-4 p-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-sand-100">
                    {hero && (
                      <Image
                        src={hero.url}
                        alt={p.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{p.name}</p>
                    <p className="text-xs text-sand-500">
                      {formatMRU(p.price_mru)} · {p.view_count} views ·{" "}
                      {p.purchase_count} sold
                    </p>
                  </div>
                  <Link
                    href={`/product/${p.id}`}
                    className="text-xs text-indigo-500 hover:underline"
                  >
                    View
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
