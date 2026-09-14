"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function MessageSellerButton({
  merchantId,
  productId,
}: {
  merchantId: string;
  productId?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function startConversation() {
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Find an existing thread for this customer+merchant(+product), else create one
    let query = supabase
      .from("conversations")
      .select("id")
      .eq("customer_id", user.id)
      .eq("merchant_id", merchantId);
    query = productId ? query.eq("product_id", productId) : query.is("product_id", null);
    const { data: existing } = await query.maybeSingle();

    if (existing) {
      router.push(`/messages/${existing.id}`);
      return;
    }

    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        customer_id: user.id,
        merchant_id: merchantId,
        product_id: productId ?? null,
      })
      .select("id")
      .single();

    setBusy(false);
    if (created) router.push(`/messages/${created.id}`);
    if (error) console.error(error);
  }

  return (
    <button
      onClick={startConversation}
      disabled={busy}
      className="rounded border border-indigo-600 px-4 py-1.5 text-sm text-sand-200 hover:bg-indigo-800 disabled:opacity-60"
    >
      {busy ? "Opening…" : "Message seller"}
    </button>
  );
}
