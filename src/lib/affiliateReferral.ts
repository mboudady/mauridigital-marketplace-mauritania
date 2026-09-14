const KEY = "affiliate_referrals";
const MAX_ENTRIES = 50;
const WINDOW_DAYS = 30;

type Referral = { productId: string; creatorId: string; clickedAt: number };

function readAll(): Referral[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: Referral[] = JSON.parse(raw);
    const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
    return parsed.filter((r) => r.clickedAt > cutoff);
  } catch {
    return [];
  }
}

function writeAll(referrals: Referral[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(referrals.slice(-MAX_ENTRIES)));
}

/** Record that this browser arrived at a product via a creator's referral link. */
export function recordReferral(productId: string, creatorId: string) {
  const all = readAll().filter((r) => r.productId !== productId);
  all.push({ productId, creatorId, clickedAt: Date.now() });
  writeAll(all);
}

/** For checkout: build the {product_id, creator_id} payload for a set of product IDs. */
export function getReferralsForProducts(
  productIds: string[]
): { product_id: string; creator_id: string }[] {
  const all = readAll();
  return productIds
    .map((id) => all.find((r) => r.productId === id))
    .filter((r): r is Referral => !!r)
    .map((r) => ({ product_id: r.productId, creator_id: r.creatorId }));
}
