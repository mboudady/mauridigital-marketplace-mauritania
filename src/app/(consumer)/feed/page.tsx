import { createClient } from "@/lib/supabase/server";
import { VerticalFeed, type FeedCardData } from "@/components/VerticalFeed";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Candidate pool: recent + broadly popular. Personalization re-ranks
  // this pool below rather than changing what's eligible to appear.
  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, price_mru, merchant_id, purchase_count, like_count, view_count, created_at, merchants(store_name), product_media(url, is_hero, type, display_order)"
    )
    .order("purchase_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  // V1 behavioral ranking: pull the signed-in user's recent activity and
  // boost products/categories/merchants they've actually engaged with.
  // Purchases count far more than likes, per the roadmap's weighting.
  let likedProductIds = new Set<string>();
  let purchasedMerchantIds = new Set<string>();
  let engagedMerchantIds = new Set<string>();

  if (user) {
    const { data: recentEvents } = await supabase
      .from("events")
      .select("event_type, product_id, merchant_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    for (const e of recentEvents ?? []) {
      if (e.event_type === "like" && e.product_id) likedProductIds.add(e.product_id);
      if (e.event_type === "purchase" && e.merchant_id) purchasedMerchantIds.add(e.merchant_id);
      if (
        (e.event_type === "product_view" || e.event_type === "add_to_cart") &&
        e.merchant_id
      ) {
        engagedMerchantIds.add(e.merchant_id);
      }
    }
  }

  const now = Date.now();
  const scored = (products ?? []).map((p) => {
    let score =
      (p.purchase_count ?? 0) * 5 +
      (p.like_count ?? 0) * 1 +
      (p.view_count ?? 0) * 0.1;

    const ageDays = (now - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 5 - ageDays * 0.5); // freshness boost, decays over ~10 days

    if (purchasedMerchantIds.has(p.merchant_id)) score += 8; // bought here before
    if (engagedMerchantIds.has(p.merchant_id)) score += 3; // browsed here before
    if (likedProductIds.has(p.id)) score -= 20; // seen and liked already; de-prioritize repeat

    return { p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const cards: FeedCardData[] = scored.slice(0, 30).map(({ p }) => {
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
      merchantId: p.merchant_id,
      storeName:
        (p.merchants as unknown as { store_name: string } | null)
          ?.store_name ?? "",
      heroImageUrl: hero?.url ?? null,
      videoEmbedUrl: video?.url ?? null,
    };
  });

  return <VerticalFeed products={cards} />;
}
