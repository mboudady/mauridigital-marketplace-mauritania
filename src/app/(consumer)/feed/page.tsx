import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VerticalFeed, type FeedCardData } from "@/components/VerticalFeed";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";

function FeedTabs({ active }: { active: "for-you" | "following" }) {
  return (
    <div className="safe-top relative flex items-center justify-center gap-6 bg-ink-950 py-3 text-sm">
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
      <Link href="/live" className="flex items-center gap-1 text-ink-500">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        LIVE
      </Link>
      <Link
        href="/search"
        aria-label="Search"
        className="absolute right-4 text-ink-50"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </Link>
    </div>
  );
}

type ScoredCard = FeedCardData & { score: number; merchantIdForFollow: string; createdAt: string };

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

  // "Merchants should only see affiliate creator posts, not other
  // merchants' products" — check the viewer's role to decide which
  // content sources are eligible.
  let isMerchantViewer = false;
  if (user) {
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    isMerchantViewer = !!roles?.some((r) => r.role === "merchant");
  }

  let followedMerchantIds: string[] = [];
  if (isFollowing && user) {
    const { data: follows } = await supabase
      .from("follows")
      .select("merchant_id")
      .eq("follower_id", user.id);
    followedMerchantIds = (follows ?? []).map((f) => f.merchant_id);
  }
  const followFilterIds = followedMerchantIds.length
    ? followedMerchantIds
    : ["00000000-0000-0000-0000-000000000000"];

  // --- Merchant-authored products (hidden entirely from merchant viewers) ---
  let productRows: any[] = [];
  if (!isMerchantViewer) {
    let query = supabase
      .from("products")
      .select(
        "id, name, price_mru, merchant_id, purchase_count, like_count, view_count, created_at, merchants(store_name), product_media(url, is_hero, type, display_order), product_hashtags(hashtags(tag))"
      );
    if (isFollowing) query = query.in("merchant_id", followFilterIds);
    const { data } = await query
      .order("purchase_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(60);
    productRows = data ?? [];
  }

  // --- Affiliate creator posts (visible to everyone) ---
  let creatorPostQuery = supabase
    .from("creator_posts")
    .select(
      "id, caption, view_count, like_count, created_at, product_id, creator_id, products(price_mru, merchant_id, merchants(store_name)), creator_post_media(url, is_hero, type, display_order), creator_post_hashtags(hashtags(tag))"
    );
  if (isFollowing) {
    // "Following" for creator posts = posts about products from merchants you follow
    creatorPostQuery = creatorPostQuery.filter(
      "products.merchant_id",
      "in",
      `(${followFilterIds.join(",")})`
    );
  }
  const { data: creatorPostRows } = await creatorPostQuery
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
      if ((e.event_type === "product_view" || e.event_type === "add_to_cart") && e.merchant_id) {
        engagedMerchantIds.add(e.merchant_id);
      }
    }
  }

  const now = Date.now();

  function scoreOf(createdAt: string, merchantId: string, purchase: number, like: number, view: number, id: string) {
    if (isFollowing) return new Date(createdAt).getTime();
    let score = purchase * 5 + like * 1 + view * 0.1;
    const ageDays = (now - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 5 - ageDays * 0.5);
    if (purchasedMerchantIds.has(merchantId)) score += 8;
    if (engagedMerchantIds.has(merchantId)) score += 3;
    if (likedProductIds.has(id)) score -= 20;
    return score;
  }

  const productCards: ScoredCard[] = productRows.map((p) => {
    const media = (p.product_media ?? []) as Array<{ url: string; is_hero: boolean | null; type: string; display_order: number }>;
    const video = media.find((m) => m.type === "video");
    const images = media
      .filter((m) => m.type === "image")
      .sort((a, b) => (a.is_hero && !b.is_hero ? -1 : !a.is_hero && b.is_hero ? 1 : a.display_order - b.display_order))
      .map((m) => m.url);
    const hashtags = ((p.product_hashtags ?? []) as Array<{ hashtags: { tag: string } | null }>)
      .map((ph) => ph.hashtags?.tag)
      .filter((t): t is string => !!t);
    return {
      id: p.id,
      name: p.name,
      price_mru: p.price_mru,
      merchantId: p.merchant_id,
      merchantIdForFollow: p.merchant_id,
      storeName: (p.merchants as unknown as { store_name: string } | null)?.store_name ?? "",
      imageUrls: images,
      videoEmbedUrl: video?.url ?? null,
      hashtags,
      sourceLabel: null,
      productId: p.id,
      createdAt: p.created_at,
      score: scoreOf(p.created_at, p.merchant_id, p.purchase_count ?? 0, p.like_count ?? 0, p.view_count ?? 0, p.id),
    };
  });

  const creatorIds = [...new Set((creatorPostRows ?? []).map((cp: any) => cp.creator_id))];
  const { data: creatorProfiles } = creatorIds.length
    ? await supabase.from("user_profiles").select("user_id, display_name").in("user_id", creatorIds)
    : { data: [] };
  const creatorNameById = new Map((creatorProfiles ?? []).map((p) => [p.user_id, p.display_name]));

  const creatorCards: ScoredCard[] = (creatorPostRows ?? [])
    .filter((cp: any) => cp.products) // guard against a deleted/inaccessible product
    .map((cp: any) => {
      const product = cp.products;
      const merchantId = product.merchant_id as string;
      const media = (cp.creator_post_media ?? []) as Array<{ url: string; is_hero: boolean | null; type: string; display_order: number }>;
      const video = media.find((m) => m.type === "video");
      const images = media
        .filter((m) => m.type === "image")
        .sort((a, b) => (a.is_hero && !b.is_hero ? -1 : !a.is_hero && b.is_hero ? 1 : a.display_order - b.display_order))
        .map((m) => m.url);
      const hashtags = ((cp.creator_post_hashtags ?? []) as Array<{ hashtags: { tag: string } | null }>)
        .map((ph) => ph.hashtags?.tag)
        .filter((t): t is string => !!t);
      return {
        id: `cp-${cp.id}`,
        name: cp.caption || "Affiliate post",
        price_mru: product.price_mru,
        merchantId,
        merchantIdForFollow: merchantId,
        storeName: (product.merchants as unknown as { store_name: string } | null)?.store_name ?? "",
        imageUrls: images,
        videoEmbedUrl: video?.url ?? null,
        hashtags,
        sourceLabel: "Affiliate post",
        productId: cp.product_id,
        creatorId: cp.creator_id,
        creatorName: creatorNameById.get(cp.creator_id) ?? "Creator",
        createdAt: cp.created_at,
        score: scoreOf(cp.created_at, merchantId, 0, cp.like_count ?? 0, cp.view_count ?? 0, cp.product_id),
      };
    });

  const merged = [...productCards, ...creatorCards].sort((a, b) => b.score - a.score).slice(0, 30);
  const cards: FeedCardData[] = merged.map(({ score, createdAt, ...card }) => card);

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
