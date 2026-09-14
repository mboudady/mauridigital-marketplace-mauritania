import { createClient } from "@/lib/supabase/server";
import { VerticalFeed, type FeedCardData } from "@/components/VerticalFeed";

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, price_mru, purchase_count, created_at, merchants(store_name), product_media(url, is_hero, type, display_order)"
    )
    .order("purchase_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(30);

  const cards: FeedCardData[] = (products ?? []).map((p) => {
    const media = (p.product_media ?? []) as Array<{
      url: string;
      is_hero: boolean | null;
      type: string;
      display_order: number;
    }>;
    const video = media.find((m) => m.type === "video");
    const hero =
      media.find((m) => m.is_hero && m.type === "image") ??
      media.find((m) => m.type === "image");
    return {
      id: p.id,
      name: p.name,
      price_mru: p.price_mru,
      storeName:
        (p.merchants as unknown as { store_name: string } | null)
          ?.store_name ?? "",
      heroImageUrl: hero?.url ?? null,
      videoEmbedUrl: video?.url ?? null,
    };
  });

  return <VerticalFeed products={cards} />;
}
