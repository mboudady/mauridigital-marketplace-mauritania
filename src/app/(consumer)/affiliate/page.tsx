"use client";

import { useEffect, useState, useCallback } from "react";
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

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [totals, setTotals] = useState({ pending: 0, approved: 0, paid: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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

  const approved = enrollments.filter((e) => e.status === "approved");
  const pending = enrollments.filter((e) => e.status === "pending");

  return (
    <main className="min-h-screen bg-indigo-900 pb-24 text-sand-100">
      <div className="safe-top mx-auto max-w-2xl px-6 pt-6 sm:px-10">
        <h1 className="font-display text-2xl text-sand-50">Affiliate earnings</h1>
        <p className="mt-1 text-sm text-sand-400">
          Apply to a merchant&rsquo;s affiliate program from any of their products.
        </p>

        <dl className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Pending", value: totals.pending },
            { label: "Approved", value: totals.approved },
            { label: "Paid out", value: totals.paid },
          ].map((s) => (
            <div key={s.label} className="rounded border border-indigo-700 bg-indigo-800 p-3">
              <dt className="text-xs text-sand-500">{s.label}</dt>
              <dd className="mt-1 font-display text-lg">{formatMRU(s.value)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-sand-500">{clickCount} total link clicks</p>

        {pending.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-medium text-sand-200">Pending applications</h2>
            <ul className="mt-2 space-y-1 text-sm text-sand-400">
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
          <h2 className="text-sm font-medium text-sand-200">Your active links</h2>
          {approved.length === 0 ? (
            <p className="mt-3 text-sm text-sand-500">
              No approved affiliate links yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {approved.map((e) => (
                <li
                  key={e.id}
                  className="rounded border border-indigo-700 bg-indigo-800 p-3"
                >
                  <p className="text-sm text-sand-100">
                    {e.affiliate_programs?.merchants?.store_name ?? "Store"}
                  </p>
                  <p className="text-xs text-sand-500">
                    {e.commission_rate}% commission
                    {!e.product_id && " · whole store"}
                  </p>
                  {e.product_id && (
                    <button
                      onClick={() => copyLink(e.id, e.product_id)}
                      className="mt-2 rounded bg-clay-500 px-3 py-1 text-xs text-sand-50"
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
