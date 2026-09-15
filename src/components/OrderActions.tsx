"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function OrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirmDelivery() {
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("confirm_delivery", {
      p_order_id: orderId,
    });
    if (rpcError) {
      setError(rpcError.message);
      setBusy(false);
      return;
    }
    router.refresh();
    setBusy(false);
  }

  async function submitRefundRequest() {
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("request_refund", {
      p_order_id: orderId,
      p_reason: reason,
    });
    if (rpcError) {
      setError(rpcError.message);
      setBusy(false);
      return;
    }
    setShowRefundForm(false);
    router.refresh();
    setBusy(false);
  }

  const canRequestRefund = !["refunded", "refunding", "cancelled"].includes(
    status
  );

  return (
    <div className="mt-6 space-y-3">
      {status === "delivered" && (
        <button
          onClick={confirmDelivery}
          disabled={busy}
          className="w-full rounded bg-ink-50 px-4 py-2.5 text-sm font-medium text-ink-950 hover:bg-ink-200 disabled:opacity-60"
        >
          {busy ? "Confirming…" : "Confirm I received this order"}
        </button>
      )}

      {canRequestRefund && !showRefundForm && (
        <button
          onClick={() => setShowRefundForm(true)}
          className="w-full rounded border border-ink-600 px-4 py-2 text-sm text-ink-100 hover:bg-ink-850"
        >
          Request a refund
        </button>
      )}

      {showRefundForm && (
        <div className="rounded border border-ink-700 bg-ink-850 p-4">
          <label className="text-xs text-ink-400">
            Why are you requesting a refund?
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded border border-ink-600 bg-ink-950 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500"
            placeholder="e.g. item never arrived, wrong product…"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={submitRefundRequest}
              disabled={busy || reason.trim().length === 0}
              className="rounded bg-ink-50 px-3 py-1.5 text-xs text-ink-950 hover:bg-ink-200 disabled:opacity-60"
            >
              Submit request
            </button>
            <button
              onClick={() => setShowRefundForm(false)}
              className="rounded border border-ink-600 px-3 py-1.5 text-xs text-ink-300 hover:bg-ink-950"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
