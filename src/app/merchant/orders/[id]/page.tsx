"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatMRU } from "@/lib/format";

type OrderDetail = {
  id: string;
  order_number: string;
  status: string;
  total_mru: number;
  delivery_address: string;
  delivery_city: string | null;
  delivery_phone: string | null;
  tracking_note: string | null;
  order_items: Array<{
    quantity: number;
    price_per_unit_mru: number;
    total_mru: number;
    products: { name: string } | null;
  }>;
};

type PendingRefund = {
  id: string;
  reason: string;
  amount_mru: number;
  requested_by_role: string;
  status: string;
};

const NEXT_ACTION: Record<string, { label: string; next: string } | null> = {
  pending: { label: "Confirm order", next: "confirmed" },
  confirmed: { label: "Mark shipped", next: "shipped" },
  shipped: { label: "Mark delivered", next: "delivered" },
  delivered: null,
  completed: null,
  cancelled: null,
  refunding: null,
  refunded: null,
  disputed: null,
};

export default function MerchantOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [refund, setRefund] = useState<PendingRefund | null>(null);
  const [trackingNote, setTrackingNote] = useState("");
  const [refundResponse, setRefundResponse] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?role=merchant");
      return;
    }

    const { data: orderData } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, total_mru, delivery_address, delivery_city, delivery_phone, tracking_note, order_items(quantity, price_per_unit_mru, total_mru, products(name))"
      )
      .eq("id", id)
      .maybeSingle();

    setOrder(orderData as unknown as OrderDetail);
    setTrackingNote(orderData?.tracking_note ?? "");

    const { data: refundData } = await supabase
      .from("refunds")
      .select("id, reason, amount_mru, requested_by_role, status")
      .eq("order_id", id)
      .eq("status", "pending")
      .maybeSingle();

    setRefund(refundData);
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function advanceStatus(nextStatus: string) {
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc(
      "merchant_update_order_status",
      {
        p_order_id: id,
        p_new_status: nextStatus,
        p_tracking_note: trackingNote || null,
      }
    );
    if (rpcError) setError(rpcError.message);
    await load();
    setBusy(false);
  }

  async function respondToRefund(approve: boolean) {
    if (!refund) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("respond_to_refund", {
      p_refund_id: refund.id,
      p_approve: approve,
      p_response: refundResponse || (approve ? "Approved" : "Rejected"),
    });
    if (rpcError) setError(rpcError.message);
    await load();
    setBusy(false);
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-ink-950 px-6 py-12 text-ink-50" />
    );
  }

  const action = NEXT_ACTION[order.status];

  return (
    <main className="min-h-screen bg-ink-950 px-6 py-12 text-ink-50 sm:px-10">
      <div className="mx-auto max-w-xl">
        <Link
          href="/merchant/orders"
          className="text-xs text-ink-500 hover:text-ink-50"
        >
          ← All orders
        </Link>
        <h1 className="mt-2 font-display text-3xl">{order.order_number}</h1>
        <p className="mt-1 text-sm capitalize text-ink-500">
          {order.status}
        </p>

        {refund && (
          <div className="mt-6 rounded border border-red-400 bg-red-400/10 p-4">
            <p className="text-sm font-medium text-red-400">
              Refund requested by {refund.requested_by_role}
            </p>
            <p className="mt-1 text-sm text-ink-100">{refund.reason}</p>
            <p className="mt-1 text-sm">{formatMRU(refund.amount_mru)}</p>
            <input
              value={refundResponse}
              onChange={(e) => setRefundResponse(e.target.value)}
              placeholder="Optional note to the customer"
              className="mt-3 w-full rounded border border-ink-600 px-3 py-1.5 text-sm"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => respondToRefund(true)}
                disabled={busy}
                className="rounded bg-ink-50 px-3 py-1.5 text-xs text-ink-950 hover:bg-ink-200 disabled:opacity-60"
              >
                Approve refund
              </button>
              <button
                onClick={() => respondToRefund(false)}
                disabled={busy}
                className="rounded border border-ink-600 px-3 py-1.5 text-xs hover:bg-ink-800 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        <ul className="mt-6 divide-y divide-ink-800 border-y border-ink-700">
          {order.order_items.map((item, i) => (
            <li key={i} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm">{item.products?.name}</p>
                <p className="text-xs text-ink-500">
                  {item.quantity} × {formatMRU(item.price_per_unit_mru)}
                </p>
              </div>
              <p className="text-sm">{formatMRU(item.total_mru)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-ink-500">Total (cash on delivery)</span>
          <span className="font-display text-lg">
            {formatMRU(order.total_mru)}
          </span>
        </div>

        <div className="mt-6 rounded border border-ink-700 bg-ink-850 p-4 text-sm">
          <p>{order.delivery_address}</p>
          <p className="text-ink-500">{order.delivery_city}</p>
          <p className="text-ink-500">{order.delivery_phone}</p>
        </div>

        {action && (
          <div className="mt-6">
            {action.next === "shipped" && (
              <input
                value={trackingNote}
                onChange={(e) => setTrackingNote(e.target.value)}
                placeholder="Tracking note (courier, tracking number…)"
                className="mb-3 w-full rounded border border-ink-600 px-3 py-2 text-sm"
              />
            )}
            <button
              onClick={() => advanceStatus(action.next)}
              disabled={busy}
              className="w-full rounded bg-ink-50 px-4 py-2.5 text-sm font-medium text-ink-950 hover:bg-ink-200 disabled:opacity-60"
            >
              {busy ? "Updating…" : action.label}
            </button>
            {order.status === "pending" && (
              <button
                onClick={() => advanceStatus("cancelled")}
                disabled={busy}
                className="mt-2 w-full rounded border border-ink-600 px-4 py-2 text-sm hover:bg-ink-800 disabled:opacity-60"
              >
                Cancel order
              </button>
            )}
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </main>
  );
}
