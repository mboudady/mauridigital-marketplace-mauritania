"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addToCart } from "@/lib/cart";
import { logEvent } from "@/lib/events";

export function AddToCartButton({
  productId,
  merchantId,
}: {
  productId: string;
  merchantId?: string;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");

  async function handleAdd() {
    setStatus("adding");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    await addToCart(supabase, user.id, productId, null, quantity);
    await logEvent(supabase, "add_to_cart", { productId, merchantId, metadata: { quantity } });
    setStatus("added");
    router.refresh();
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded border border-indigo-600">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-2 text-sand-300 hover:text-sand-50"
        >
          −
        </button>
        <span className="w-8 text-center text-sand-100">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => q + 1)}
          className="px-3 py-2 text-sand-300 hover:text-sand-50"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={status === "adding"}
        className="flex-1 rounded bg-clay-500 px-4 py-2.5 text-sm font-medium text-sand-50 transition-colors hover:bg-clay-400 disabled:opacity-60"
      >
        {status === "added"
          ? "Added ✓"
          : status === "adding"
            ? "Adding…"
            : "Add to cart"}
      </button>
    </div>
  );
}
