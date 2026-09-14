"use client";

import { useState } from "react";
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
  heroImageUrl: string | null;
  videoEmbedUrl: string | null;
};

function ActionButton({
  onClick,
  active,
  activeColor = "text-clay-400",
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-sand-50 drop-shadow-lg"
    >
      <span className={active ? activeColor : ""}>{children}</span>
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

function FeedCard({ product }: { product: FeedCardData }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);

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
      await supabase
        .from("saves")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", product.id);
      setSaved(false);
    } else {
      await supabase.from("saves").insert({ user_id: user.id, product_id: product.id });
      setSaved(true);
    }
    await logEvent(saved ? "unsave" : "save");
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
    setAdding(false);
  }

  return (
    <div className="relative h-[100dvh] w-full snap-start overflow-hidden bg-indigo-900">
      {product.videoEmbedUrl ? (
        <iframe
          src={`${product.videoEmbedUrl}?autoplay=true&loop=true&muted=true&preload=true`}
          loading="lazy"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : product.heroImageUrl ? (
        <Image
          src={product.heroImageUrl}
          alt={product.name}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sand-500">
          No media yet
        </div>
      )}

      {/* Gradient for text legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Right action rail */}
      <div className="safe-bottom absolute bottom-24 right-3 flex flex-col items-center gap-5">
        <ActionButton onClick={toggleLike} active={liked} label="Like">
          <svg width="30" height="30" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-7.5-4.6-10-9.3C.6 8.2 2 4.8 5.3 4.1c2-.4 3.9.5 5 2.1a5.9 5.9 0 011.7-2C13.8 3 17 3.4 19 6c2 2.6 1.2 6-.7 8.3C15.8 17.7 12 21 12 21z" />
          </svg>
        </ActionButton>
        <ActionButton onClick={toggleSave} active={saved} activeColor="text-sand-300" label="Save">
          <svg width="28" height="28" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M6 3.5h12a1 1 0 011 1V21l-7-4-7 4V4.5a1 1 0 011-1z" />
          </svg>
        </ActionButton>
        <ActionButton onClick={quickAdd} label={adding ? "Added" : "Cart"}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h2l1.5 10.5a1.5 1.5 0 001.5 1.3h8a1.5 1.5 0 001.5-1.3L20 8H6.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="21" r="1.3" fill="currentColor" />
            <circle cx="17" cy="21" r="1.3" fill="currentColor" />
          </svg>
        </ActionButton>
      </div>

      {/* Bottom-left product info */}
      <Link
        href={`/product/${product.id}`}
        className="safe-bottom absolute bottom-24 left-4 right-20 text-sand-50"
      >
        <p className="text-sm text-sand-300">{product.storeName}</p>
        <p className="mt-1 font-display text-lg leading-snug">
          {product.name}
        </p>
        <p className="mt-1 font-display text-base text-sand-100">
          {formatMRU(product.price_mru)}
        </p>
      </Link>
    </div>
  );
}

export function VerticalFeed({ products }: { products: FeedCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-indigo-900 px-6 text-center text-sand-100">
        <p className="font-display text-xl">No products yet</p>
        <p className="mt-2 text-sm text-sand-400">
          Check back soon, or open a store yourself.
        </p>
      </div>
    );
  }

  return (
    <div className="no-scrollbar h-[100dvh] w-full snap-y snap-mandatory overflow-y-scroll">
      {products.map((p) => (
        <FeedCard key={p.id} product={p} />
      ))}
    </div>
  );
}
