import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VerticalFeed, type FeedCardData } from "@/components/VerticalFeed";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";

function FeedTabs({ active }: { active: "for-you" | "following" }) {
  return (
    <div className="safe-top flex items-center justify-center gap-6 bg-ink-950 py-3 text-sm">
      <Link
        href="/feed"
        className={active === "for-you" ? "font-medium text-ink-50" : "text-ink-500"}
      >
        For You
      </Link>
      <Link
        href="/feed?tab=following"
        className={active === "following" ? "font-medium text-ink-50" : "text-ink-500"}
      >
        Following
      </Link>
    </div>
  );
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const isFollowing = tab === "following";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isFollowing && !user) {
    return (
      <div className="flex h-full flex-col bg-ink-950">
        <FeedTabs active="following" />
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-ink-300">
          <p className="text-sm">Log in to see products from merchants you follow.</p>
          <Link href="/login" className="mt-3 text-sm text-ink-50 underline">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  let followedMerchantIds: string[] = [];
  if (isFollowing && user) {
    const { data: follows } = await supabase
      .from("follows")
      .select("merchant_id")
      .eq("follower_id", user.id);
    followedMerchantIds = (follows ?? []).map((f) => f.merchant_id);
  }

  let query = supabase
    .from("products")
    .select(
      "id, name, price_mru, merchant_id, purchase_count, like_count, view_count, created_at, merchants(store_name), product_media(url, is_hero, type, display_order), product_hashtags(hashtags(tag))"
    );

  if (isFollowing) {
    query = query.in("merchant_id", followedMerchantIds.length ? followedMerchantIds : ["00000000-0000-0000-0000-000000000000"]);
  }

  const { data: products } = await query
    .order("purchase_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  let likedProductIds = new Set<string>();
  let purchasedMerchantIds = new Set<string>();
  let engagedMerchantIds = new Set<string>();

  if (user && !isFollowing) {
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

    if (!isFollowing) {
      const ageDays = (now - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 5 - ageDays * 0.5);
      if (purchasedMerchantIds.has(p.merchant_id)) score += 8;
      if (engagedMerchantIds.has(p.merchant_id)) score += 3;
      if (likedProductIds.has(p.id)) score -= 20;
    } else {
      score = new Date(p.created_at).getTime(); // Following: strictly newest-first
    }

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
    const images = media
      .filter((m) => m.type === "image")
      .sort((a, b) => {
        // Hero first, then by display_order
        if (a.is_hero && !b.is_hero) return -1;
        if (!a.is_hero && b.is_hero) return 1;
        return a.display_order - b.display_order;
      })
      .map((m) => m.url);
    const hashtags = ((p.product_hashtags ?? []) as Array<{ hashtags: { tag: string } | null }>)
      .map((ph) => ph.hashtags?.tag)
      .filter((t): t is string => !!t);
    return {
      id: p.id,
      name: p.name,
      price_mru: p.price_mru,
      merchantId: p.merchant_id,
      storeName:
        (p.merchants as unknown as { store_name: string } | null)
          ?.store_name ?? "",
      imageUrls: images,
      videoEmbedUrl: video?.url ?? null,
      hashtags,
    };
  });

  return (
    <div className="flex h-full flex-col bg-ink-950">
      <OnboardingTutorial />
      <FeedTabs active={isFollowing ? "following" : "for-you"} />
      <div className="min-h-0 flex-1">
        <VerticalFeed products={cards} />
      </div>
    </div>
  );
}
