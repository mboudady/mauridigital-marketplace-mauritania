"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ApprovedLink({
  productId,
  copied,
  onCopy,
}: {
  productId: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  if (!userId) return null;

  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/product/${productId}?ref=${userId}`;

  return (
    <div className="rounded border border-ink-600 bg-ink-850 p-3 text-xs">
      <p className="text-ink-300">Your affiliate link:</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="flex-1 truncate text-ink-100">{link}</code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(link);
            onCopy();
          }}
          className="shrink-0 rounded bg-spark-500 px-2 py-1 text-ink-50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export function AffiliateAction({
  merchantId,
  productId,
}: {
  merchantId: string;
  productId: string;
}) {
  const router = useRouter();
  const [programEnabled, setProgramEnabled] = useState(false);
  const [status, setStatus] = useState<
    "none" | "pending" | "approved" | "rejected" | "applying"
  >("none");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: program } = await supabase
        .from("affiliate_programs")
        .select("id, enabled")
        .eq("merchant_id", merchantId)
        .eq("enabled", true)
        .maybeSingle();

      if (!program) return;
      setProgramEnabled(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: enrollment } = await supabase
        .from("affiliate_enrollments")
        .select("status")
        .eq("program_id", program.id)
        .eq("creator_id", user.id)
        .or(`product_id.eq.${productId},product_id.is.null`)
        .maybeSingle();

      if (enrollment) setStatus(enrollment.status as typeof status);
    })();
  }, [merchantId, productId]);

  async function apply() {
    setStatus("applying");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { error } = await supabase.rpc("apply_for_affiliate", {
      p_merchant_id: merchantId,
      p_product_id: productId,
    });
    setStatus(error ? "none" : "pending");
  }

  if (!programEnabled) return null;

  if (status === "approved") {
    return (
      <ApprovedLink
        productId={productId}
        copied={copied}
        onCopy={() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      />
    );
  }

  return (
    <div className="rounded border border-dashed border-ink-600 p-3 text-xs text-ink-300">
      {status === "pending" && "Your affiliate application is pending approval."}
      {status === "rejected" && "Your affiliate application wasn't approved."}
      {(status === "none" || status === "applying") && (
        <button
          onClick={apply}
          disabled={status === "applying"}
          className="text-ink-100 underline decoration-ink-500 hover:text-ink-50"
        >
          {status === "applying" ? "Applying…" : "Become an affiliate for this product"}
        </button>
      )}
    </div>
  );
}
