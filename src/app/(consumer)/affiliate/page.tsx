"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatMRU } from "@/lib/format";

type EnrollmentRow = {
  id: string;
  status: string;
  commission_rate: number;
  product_id: string | null;
  affiliate_programs: { merchants: { store_name: string } | null } | null;
};

type PayoutRow = {
  id: string;
  amount_mru: number;
  status: string | null;
  payout_method: string | null;
  created_at: string;
  completed_at: string | null;
};

const MIN_PAYOUT = 5000;

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [totals, setTotals] = useState({ pending: 0, approved: 0, paid: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [method, setMethod] = useState("bankily");
  const [phone, setPhone] = useState("");
  const [payoutStatus, setPayoutStatus] = useState<"idle" | "saving" | "error">("idle");
  const [payoutError, setPayoutError] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserId(user.id);

    const { data: enr } = await supabase
      .from("affiliate_enrollments")
      .select("id, status, commission_rate, product_id, affiliate_programs(merchants(store_name))")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });
    setEnrollments((enr as unknown as EnrollmentRow[]) ?? []);

    const { data: commissions } = await supabase
      .from("affiliate_commissions")
      .select("status, commission_amount_mru")
      .eq("creator_id", user.id);

    const t = { pending: 0, approved: 0, paid: 0 };
    (commissions ?? []).forEach((c) => {
      if (c.status === "pending") t.pending += c.commission_amount_mru;
      if (c.status === "approved") t.approved += c.commission_amount_mru;
      if (c.status === "paid") t.paid += c.commission_amount_mru;
    });
    setTotals(t);

    const { count } = await supabase
      .from("affiliate_clicks")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", user.id);
    setClickCount(count ?? 0);

    const { data: payoutRows } = await supabase
      .from("payouts")
      .select("id, amount_mru, status, payout_method, created_at, completed_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setPayouts(payoutRows ?? []);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  function copyLink(enrollmentId: string, productId: string | null) {
    if (!productId || !userId) return;
    const link = `${window.location.origin}/product/${productId}?ref=${userId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(enrollmentId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function submitPayoutRequest(e: React.FormEvent) {
    e.preventDefault();
    setPayoutStatus("saving");
    setPayoutError("");
    const supabase = createClient();
    const { error } = await supabase.rpc("request_payout", { p_method: method, p_phone: phone });
    if (error) {
      setPayoutStatus("error");
      setPayoutError(error.message);
      return;
    }
    setShowPayoutForm(false);
    setPhone("");
    setPayoutStatus("idle");
    await load();
  }

  const approved = enrollments.filter((e) => e.status === "approved");
  const pending = enrollments.filter((e) => e.status === "pending");
  const canRequestPayout = totals.approved >= MIN_PAYOUT;

  return (
    <main className="min-h-screen bg-ink-950 text-ink-100">
      <div className="safe-top mx-auto max-w-2xl px-6 pt-6 sm:px-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-ink-50">Affiliate earnings</h1>
          {userId && (
            <Link href={`/creator/${userId}`} className="text-xs text-ink-400 underline">
              View public profile
            </Link>
          )}
        </div>
        <p className="mt-1 text-sm text-ink-400">
          Apply to a merchant&rsquo;s affiliate program from any of their products.
        </p>

        <dl className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Pending", value: totals.pending },
            { label: "Approved", value: totals.approved },
            { label: "Paid out", value: totals.paid },
          ].map((s) => (
            <div key={s.label} className="rounded border border-ink-700 bg-ink-850 p-3">
              <dt className="text-xs text-ink-500">{s.label}</dt>
              <dd className="mt-1 font-display text-lg">{formatMRU(s.value)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-ink-500">{clickCount} total link clicks</p>

        <section className="mt-6 rounded border border-ink-700 bg-ink-850 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-100">Available to withdraw</p>
              <p className="font-display text-xl">{formatMRU(totals.approved)}</p>
            </div>
            <button
              onClick={() => setShowPayoutForm((v) => !v)}
              disabled={!canRequestPayout}
              className="rounded-full bg-ink-50 px-4 py-2 text-xs font-medium text-ink-950 disabled:opacity-40"
            >
              Request payout
            </button>
          </div>
          {!canRequestPayout && (
            <p className="mt-2 text-xs text-ink-500">
              Minimum payout is {formatMRU(MIN_PAYOUT)}.
            </p>
          )}

          {showPayoutForm && (
            <form onSubmit={submitPayoutRequest} className="mt-4 space-y-3 border-t border-ink-700 pt-4">
              <div>
                <label className="text-xs text-ink-400">Payout method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="mt-1 w-full rounded border border-ink-600 bg-ink-900 px-3 py-2 text-sm focus:border-ink-100 focus:outline-none focus:ring-1 focus:ring-ink-100"
                >
                  <option value="bankily">Bankily</option>
                  <option value="masrivi">Masrivi</option>
                  <option value="bank_transfer">Bank transfer</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-ink-400">Phone / account number</label>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded border border-ink-600 bg-ink-900 px-3 py-2 text-sm focus:border-ink-100 focus:outline-none focus:ring-1 focus:ring-ink-100"
                />
              </div>
              {payoutStatus === "error" && <p className="text-xs text-red-400">{payoutError}</p>}
              <button
                type="submit"
                disabled={payoutStatus === "saving"}
                className="w-full rounded bg-ink-50 px-4 py-2 text-sm font-medium text-ink-950 disabled:opacity-60"
              >
                {payoutStatus === "saving" ? "Submitting…" : `Request ${formatMRU(totals.approved)}`}
              </button>
            </form>
          )}
        </section>

        {payouts.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-medium text-ink-100">Payout history</h2>
            <ul className="mt-2 divide-y divide-ink-800 rounded border border-ink-700 bg-ink-850">
              {payouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <p>{formatMRU(p.amount_mru)}</p>
                    <p className="text-xs text-ink-500">
                      {p.payout_method} · {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={p.status === "completed" ? "text-ink-50" : "text-ink-500"}>
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {pending.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-medium text-ink-100">Pending applications</h2>
            <ul className="mt-2 space-y-1 text-sm text-ink-400">
              {pending.map((e) => (
                <li key={e.id}>
                  {e.affiliate_programs?.merchants?.store_name ?? "Store"} —
                  awaiting approval
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink-100">Your active links</h2>
            <Link href="/affiliate/post/new" className="text-xs text-ink-400 underline">
              + New post
            </Link>
          </div>
          {approved.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">
              No approved affiliate links yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {approved.map((e) => (
                <li
                  key={e.id}
                  className="rounded border border-ink-700 bg-ink-850 p-3"
                >
                  <p className="text-sm text-ink-100">
                    {e.affiliate_programs?.merchants?.store_name ?? "Store"}
                  </p>
                  <p className="text-xs text-ink-500">
                    {e.commission_rate}% commission
                    {!e.product_id && " · whole store"}
                  </p>
                  {e.product_id && (
                    <button
                      onClick={() => copyLink(e.id, e.product_id)}
                      className="mt-2 rounded bg-ink-50 px-3 py-1 text-xs text-ink-950"
                    >
                      {copiedId === e.id ? "Copied" : "Copy link"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
