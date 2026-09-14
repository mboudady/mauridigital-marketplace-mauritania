"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { logEvent } from "@/lib/events";

export function ViewTracker({
  productId,
  merchantId,
}: {
  productId: string;
  merchantId: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    logEvent(createClient(), "product_view", { productId, merchantId });
  }, [productId, merchantId]);

  return null;
}
