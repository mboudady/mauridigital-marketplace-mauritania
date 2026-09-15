"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addToCart } from "@/lib/cart";
import { logEvent as logEventHelper } from "@/lib/events";
import { formatMRU } from "@/lib/format";
import { CommentsSheet } from "@/components/CommentsSheet";

export type FeedCardData = {
  id: string;
  productId: string;
  name: string;
  price_mru: number;
  storeName: string;
  merchantId: string;
  imageUrls: string[];
  videoEmbedUrl: string | null;
  hashtags: string[];
  sourceLabel: string | null;
  creatorId?: string;
  creatorName?: string;
};

function RailButton({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-white drop-shadow-lg"
    >
      <span>{children}</span>
      {label && <span className="text-[10px]">{label}</span>}
    </button>
  );
}

function FeedCard({
  product,
  soundOn,
  onToggleSound,
}: {
  product: FeedCardData;
  soundOn: boolean;
  onToggleSound: () => void;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const gestureStart = useRef<{ x: number; y: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [showPauseFlash, setShowPauseFlash] = useState(false);

  function togglePause() {
    setPaused((p) => !p);
    setShowPauseFlash(true);
    setTimeout(() => setShowPauseFlash(false), 500);
  }
  const [commentsOpen, setCommentsOpen] = useState(false);

  // Auto-advance through photos every 3s when there's no video and more
  // than one image. Restarts on every index change (including manual swipes
  // or taps), so a manual navigation gets its own full 3s before advancing.
  useEffect(() => {
    if (product.videoEmbedUrl || product.imageUrls.length <= 1) return;
    const timer = setInterval(() => {
      setImageIndex((i) => (i + 1) % product.imageUrls.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [product.videoEmbedUrl, product.imageUrls.length, imageIndex]);

  function handleGestureStart(e: React.PointerEvent) {
    gestureStart.current = { x: e.clientX, y: e.clientY };
  }

  function handleGestureEnd(e: React.PointerEvent) {
    const start = gestureStart.current;
    gestureStart.current = null;
    if (!start || product.imageUrls.length <= 1) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    // A mostly-vertical drag is the user swiping to the next/previous
    // product in the feed — leave it to the native scroll-snap container,
    // don't treat it as a photo swipe.
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) return;

    const SWIPE_THRESHOLD = 40;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) {
        setImageIndex((i) => (i + 1) % product.imageUrls.length);
      } else {
        setImageIndex((i) => (i - 1 + product.imageUrls.length) % product.imageUrls.length);
      }
    } else {
      // Treat as a tap: left half = previous, right half = next.
      const rect = e.currentTarget.getBoundingClientRect();
      const tapX = e.clientX - rect.left;
      if (tapX < rect.width / 2) {
        setImageIndex((i) => (i - 1 + product.imageUrls.length) % product.imageUrls.length);
      } else {
        setImageIndex((i) => (i + 1) % product.imageUrls.length);
      }
    }
  }

  async function logEvent(eventType: "like" | "unlike" | "save" | "unsave" | "add_to_cart") {
    const supabase = createClient();
    await logEventHelper(supabase, eventType, {
      productId: product.productId,
      merchantId: product.merchantId,
    });
  }

  async function toggleLike() {
    setLiked((v) => !v);
    await logEvent(liked ? "unlike" : "like");
  }

  async function toggleSave() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (saved) {
      await supabase.from("saves").delete().eq("user_id", user.id).eq("product_id", product.productId);
      setSaved(false);
    } else {
      await supabase.from("saves").insert({ user_id: user.id, product_id: product.productId });
      setSaved(true);
    }
    await logEvent(saved ? "unsave" : "save");
  }

  async function toggleFollow() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (product.creatorId) {
      if (following) {
        await supabase.from("creator_follows").delete().eq("follower_id", user.id).eq("creator_id", product.creatorId);
        setFollowing(false);
      } else {
        await supabase.from("creator_follows").insert({ follower_id: user.id, creator_id: product.creatorId });
        setFollowing(true);
      }
    } else {
      if (following) {
        await supabase.from("follows").delete().eq("follower_id", user.id).eq("merchant_id", product.merchantId);
        setFollowing(false);
      } else {
        await supabase.from("follows").insert({ follower_id: user.id, merchant_id: product.merchantId });
        setFollowing(true);
      }
    }
  }

  async function quickAdd() {
    setAdding(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    await addToCart(supabase, user.id, product.productId, null, 1);
    await logEvent("add_to_cart");
    setTimeout(() => setAdding(false), 1200);
  }

  return (
    <div className="relative flex h-full w-full snap-start flex-col bg-ink-950">
      {/* Media area */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {product.videoEmbedUrl ? (
          <>
            <iframe
              key={`${soundOn ? "s1" : "s0"}-${paused ? "p1" : "p0"}`}
              src={`${product.videoEmbedUrl}?autoplay=${!paused}&loop=true&muted=${!soundOn}&preload=true`}
              loading="lazy"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
            <button
              aria-label={paused ? "Play" : "Pause"}
              onClick={togglePause}
              className="absolute inset-0 h-full w-full"
            />
            {showPauseFlash && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 text-white">
                  {paused ? (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="5" width="4" height="14" />
                      <rect x="14" y="5" width="4" height="14" />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </>
        ) : product.imageUrls[imageIndex] ? (
          <Image
            src={product.imageUrls[imageIndex]}
            alt={product.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-500">
            No media yet
          </div>
        )}

        {/* Manual navigation: tap left/right half, or swipe left/right.
            Sits beneath the rail/hashtag/sound-toggle elements in DOM
            order so those still receive clicks at their own position.
            Uses pointer events (not onClick) so real drag/swipe gestures
            register, not just taps — a mostly-vertical drag is left alone
            so it doesn't fight the feed's own vertical scroll-snap. */}
        {!product.videoEmbedUrl && product.imageUrls.length > 1 && (
          <div
            onPointerDown={handleGestureStart}
            onPointerUp={handleGestureEnd}
            className="absolute inset-0"
          />
        )}

        {!product.videoEmbedUrl && product.imageUrls.length > 1 && (
          <div className="pointer-events-none absolute bottom-10 left-0 right-0 flex justify-center gap-1.5">
            {product.imageUrls.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-1 rounded-full ${
                  i === imageIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

        {product.sourceLabel && (
          <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
            {product.sourceLabel}
          </span>
        )}

        {/* Sound toggle */}
        {product.videoEmbedUrl && (
          <button
            onClick={onToggleSound}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
            aria-label={soundOn ? "Mute" : "Unmute"}
          >
            {soundOn ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 9v6h4l5 5V4L8 9H4z" />
                <path d="M16.5 8.5a5 5 0 010 7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 9v6h4l5 5V4L8 9H4z" />
                <path d="M16 9l4 6M20 9l-4 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}

        {/* Hashtags */}
        {product.hashtags.length > 0 && (
          <div className="absolute bottom-3 left-3 right-16 flex flex-wrap gap-1.5">
            {product.hashtags.slice(0, 4).map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent("#" + tag)}`}
                className="text-xs font-medium text-white drop-shadow"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Right rail: creator/merchant avatar + follow, like, comment, save */}
        <div className="absolute bottom-3 right-3 flex flex-col items-center gap-4">
          <div className="relative">
            <Link
              href={product.creatorId ? `/creator/${product.creatorId}` : `/store/${product.merchantId}`}
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-ink-500 font-display text-sm text-white"
            >
              {(product.creatorName ?? product.storeName).charAt(0).toUpperCase()}
            </Link>
            <button
              onClick={toggleFollow}
              className={`absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full text-[11px] ${
                following ? "bg-white/30 text-white" : "bg-white text-black"
              }`}
              aria-label={following ? "Unfollow" : "Follow"}
            >
              {following ? "✓" : "+"}
            </button>
          </div>

          <RailButton onClick={toggleLike} active={liked} label="Like">
            <svg width="30" height="30" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7.5-4.6-10-9.3C.6 8.2 2 4.8 5.3 4.1c2-.4 3.9.5 5 2.1a5.9 5.9 0 011.7-2C13.8 3 17 3.4 19 6c2 2.6 1.2 6-.7 8.3C15.8 17.7 12 21 12 21z" />
            </svg>
          </RailButton>
          <RailButton onClick={() => setCommentsOpen(true)} label="Comment">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v7A2.5 2.5 0 0117.5 15H11l-4 3.5V15H6.5A2.5 2.5 0 014 12.5v-7z" strokeLinejoin="round" />
            </svg>
          </RailButton>
          <RailButton onClick={toggleSave} active={saved} label="Save">
            <svg width="28" height="28" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M6 3.5h12a1 1 0 011 1V21l-7-4-7 4V4.5a1 1 0 011-1z" />
            </svg>
          </RailButton>
        </div>
      </div>

      {/* Horizontal product bar, underneath the media */}
      <div className="flex shrink-0 items-center gap-3 border-t border-ink-800 bg-ink-900 px-3 py-2.5">
        <Link href={`/product/${product.productId}`} className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-ink-800">
          {product.imageUrls[0] && (
            <Image src={product.imageUrls[0]} alt="" fill sizes="44px" className="object-cover" />
          )}
        </Link>
        <Link href={`/product/${product.productId}`} className="min-w-0 flex-1">
          <p className="truncate text-sm text-ink-50">{product.name}</p>
          <p className="font-display text-sm text-ink-100">{formatMRU(product.price_mru)}</p>
        </Link>
        <button
          onClick={quickAdd}
          disabled={adding}
          aria-label="Add to cart"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-600 text-ink-50 disabled:opacity-70"
        >
          {adding ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 6h2l1.5 10.5a1.5 1.5 0 001.5 1.3h8a1.5 1.5 0 001.5-1.3L20 8H6.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="21" r="1.2" fill="currentColor" />
                <circle cx="17" cy="21" r="1.2" fill="currentColor" />
              </svg>
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink-50 text-[10px] leading-none text-ink-950">
                +
              </span>
            </>
          )}
        </button>
      </div>

      {commentsOpen && (
        <CommentsSheet productId={product.productId} onClose={() => setCommentsOpen(false)} />
      )}
    </div>
  );
}

export function VerticalFeed({ products }: { products: FeedCardData[] }) {
  const [soundOn, setSoundOn] = useState(false);

  if (products.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-ink-950 px-6 text-center text-ink-100">
        <p className="font-display text-xl">No products yet</p>
        <p className="mt-2 text-sm text-ink-400">
          Check back soon, or open a store yourself.
        </p>
      </div>
    );
  }

  return (
    <div className="no-scrollbar h-full w-full snap-y snap-mandatory overflow-y-scroll lg:mx-auto lg:max-w-[460px] lg:border-x lg:border-ink-800">
      {products.map((p) => (
        <FeedCard
          key={p.id}
          product={p}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn((v) => !v)}
        />
      ))}
    </div>
  );
}
