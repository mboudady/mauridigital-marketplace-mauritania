"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addToCart } from "@/lib/cart";
import { logEvent as logEventHelper } from "@/lib/events";
import { formatMRU } from "@/lib/format";

export type FeedCardData = {
  id: string;
  name: string;
  price_mru: number;
  storeName: string;
  merchantId: string;
  imageUrls: string[];
  videoEmbedUrl: string | null;
  hashtags: string[];
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

  // Auto-advance through photos every 3s when there's no video and more
  // than one image — same "slideshow" pattern as Instagram carousel posts.
  useEffect(() => {
    if (product.videoEmbedUrl || product.imageUrls.length <= 1) return;
    const timer = setInterval(() => {
      setImageIndex((i) => (i + 1) % product.imageUrls.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [product.videoEmbedUrl, product.imageUrls.length]);

  async function logEvent(eventType: "like" | "unlike" | "save" | "unsave" | "add_to_cart") {
    const supabase = createClient();
    await logEventHelper(supabase, eventType, {
      productId: product.id,
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
      await supabase.from("saves").delete().eq("user_id", user.id).eq("product_id", product.id);
      setSaved(false);
    } else {
      await supabase.from("saves").insert({ user_id: user.id, product_id: product.id });
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
    if (following) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("merchant_id", product.merchantId);
      setFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, merchant_id: product.merchantId });
      setFollowing(true);
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
    await addToCart(supabase, user.id, product.id, null, 1);
    await logEvent("add_to_cart");
    setTimeout(() => setAdding(false), 1200);
  }

  return (
    <div className="relative flex h-full w-full snap-start flex-col bg-ink-950">
      {/* Media area */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {product.videoEmbedUrl ? (
          <iframe
            key={soundOn ? "sound-on" : "sound-off"}
            src={`${product.videoEmbedUrl}?autoplay=true&loop=true&muted=${!soundOn}&preload=true`}
            loading="lazy"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
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

        {!product.videoEmbedUrl && product.imageUrls.length > 1 && (
          <div className="pointer-events-none absolute left-0 right-0 top-3 flex justify-center gap-1.5">
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

        {/* Right rail: merchant avatar + follow, like, save */}
        <div className="absolute bottom-3 right-3 flex flex-col items-center gap-4">
          <div className="relative">
            <Link
              href={`/store/${product.merchantId}`}
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-ink-500 font-display text-sm text-white"
            >
              {product.storeName.charAt(0).toUpperCase()}
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
          <RailButton onClick={toggleSave} active={saved} label="Save">
            <svg width="28" height="28" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M6 3.5h12a1 1 0 011 1V21l-7-4-7 4V4.5a1 1 0 011-1z" />
            </svg>
          </RailButton>
        </div>
      </div>

      {/* Horizontal product bar, underneath the media */}
      <div className="flex shrink-0 items-center gap-3 border-t border-ink-800 bg-ink-900 px-3 py-2.5">
        <Link href={`/product/${product.id}`} className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-ink-800">
          {product.imageUrls[0] && (
            <Image src={product.imageUrls[0]} alt="" fill sizes="44px" className="object-cover" />
          )}
        </Link>
        <Link href={`/product/${product.id}`} className="min-w-0 flex-1">
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
    <div className="no-scrollbar h-full w-full snap-y snap-mandatory overflow-y-scroll">
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
