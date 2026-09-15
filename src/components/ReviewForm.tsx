"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ReviewForm({
  orderId,
  productId,
  merchantId,
  onDone,
}: {
  orderId: string;
  productId: string;
  merchantId: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function submit() {
    setStatus("saving");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      order_id: orderId,
      product_id: productId,
      merchant_id: merchantId,
      customer_id: user.id,
      rating_product: rating,
      rating_merchant: rating,
      text: text || null,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(
        error.code === "23505" ? "You already reviewed this order." : error.message
      );
      return;
    }

    setStatus("done");
    onDone?.();
    router.refresh();
  }

  if (status === "done") {
    return <p className="text-sm text-ink-300">Thanks for your review!</p>;
  }

  return (
    <div className="rounded border border-ink-700 bg-ink-850 p-4">
      <p className="text-sm text-ink-100">Rate this order</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-2xl ${star <= rating ? "text-red-400" : "text-ink-300"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="How was it? (optional)"
        className="mt-3 w-full rounded border border-ink-600 bg-ink-950 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500"
      />
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
      )}
      <button
        onClick={submit}
        disabled={status === "saving"}
        className="mt-3 rounded bg-ink-50 px-4 py-1.5 text-sm text-ink-950 hover:bg-ink-200 disabled:opacity-60"
      >
        {status === "saving" ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}
