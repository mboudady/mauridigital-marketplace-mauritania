"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { recordReferral } from "@/lib/affiliateReferral";

function getSessionId(): string {
  let id = sessionStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("session_id", id);
  }
  return id;
}

export function AffiliateRefTracker({ productId }: { productId: string }) {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const fired = useRef(false);

  useEffect(() => {
    if (!ref || fired.current) return;
    fired.current = true;
    recordReferral(productId, ref);
    createClient().rpc("log_affiliate_click", {
      p_creator_id: ref,
      p_product_id: productId,
      p_session_id: getSessionId(),
    });
  }, [ref, productId]);

  return null;
}
