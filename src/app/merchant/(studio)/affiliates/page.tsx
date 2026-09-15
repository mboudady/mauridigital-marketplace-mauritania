"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatMRU } from "@/lib/format";

type Program = { id: string; enabled: boolean | null; default_commission_rate: number };
type Enrollment = {
  id: string;
  status: string | null;
  commission_rate: number;
  creator_id: string;
  product_id: string | null;
  created_at: string;
};

export default function MerchantAffiliatesPage() {
  const router = useRouter();
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [rate, setRate] = useState("10");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [commissionTotals, setCommissionTotals] = useState<Record<string, number>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?role=merchant");
      return;
    }
    const { data: merchant } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!merchant) {
      router.push("/onboarding");
      return;
    }
    setMerchantId(merchant.id);

    let { data: prog } = await supabase
      .from("affiliate_programs")
      .select("id, enabled, default_commission_rate")
      .eq("merchant_id", merchant.id)
      .maybeSingle();

    if (!prog) {
      const { data: created } = await supabase
        .from("affiliate_programs")
        .insert({ merchant_id: merchant.id, enabled: false, default_commission_rate: 10 })
        .select("id, enabled, default_commission_rate")
        .single();
      prog = created;
    }

    setProgram(prog);
    setRate(String(prog?.default_commission_rate ?? 10));

    if (prog) {
      const { data: enr } = await supabase
        .from("affiliate_enrollments")
        .select("id, status, commission_rate, creator_id, product_id, created_at")
        .eq("program_id", prog.id)
        .order("created_at", { ascending: false });
      setEnrollments(enr ?? []);

      const { data: commissions } = await supabase
        .from("affiliate_commissions")
        .select("creator_id, commission_amount_mru")
        .eq("merchant_id", merchant.id)
        .in("status", ["approved", "paid"]);

      const totals: Record<string, number> = {};
      (commissions ?? []).forEach((c) => {
        totals[c.creator_id] = (totals[c.creator_id] ?? 0) + c.commission_amount_mru;
      });
      setCommissionTotals(totals);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveSettings() {
    if (!program) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("affiliate_programs")
      .update({ default_commission_rate: parseFloat(rate) })
      .eq("id", program.id);
    await load();
    setSaving(false);
  }

  async function toggleEnabled() {
    if (!program) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("affiliate_programs")
      .update({ enabled: !program.enabled })
      .eq("id", program.id);
    await load();
    setSaving(false);
  }

  async function respond(enrollmentId: string, approve: boolean) {
    setBusyId(enrollmentId);
    const supabase = createClient();
    await supabase.rpc("respond_to_affiliate_application", {
      p_enrollment_id: enrollmentId,
      p_approve: approve,
      p_reason: undefined,
    });
    await load();
    setBusyId(null);
  }

  const pending = enrollments.filter((e) => e.status === "pending");
  const approved = enrollments.filter((e) => e.status === "approved");

  return (
    <div>
      <p className="text-sm text-ink-500">
          Let creators earn a commission for driving sales to your products.
        </p>

        <dl className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-ink-700 bg-ink-850 p-4">
            <dt className="text-xs text-ink-400">Status</dt>
            <dd className="mt-1.5 font-display text-lg">{program?.enabled ? "Open" : "Closed"}</dd>
          </div>
          <div className="rounded-lg border border-ink-700 bg-ink-850 p-4">
            <dt className="text-xs text-ink-400">Pending</dt>
            <dd className="mt-1.5 font-display text-2xl">{pending.length}</dd>
          </div>
          <div className="rounded-lg border border-ink-700 bg-ink-850 p-4">
            <dt className="text-xs text-ink-400">Active affiliates</dt>
            <dd className="mt-1.5 font-display text-2xl">{approved.length}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-ink-700 bg-ink-850 p-4">
          <div>
            <p className="text-sm font-medium">
              {program?.enabled ? "Program is open" : "Program is closed"}
            </p>
            <p className="text-xs text-ink-500">
              Creators can apply once this is open
            </p>
          </div>
          <button
            onClick={toggleEnabled}
            disabled={saving}
            className={`rounded px-4 py-1.5 text-sm font-medium disabled:opacity-60 ${
              program?.enabled
                ? "border border-ink-600 text-ink-300"
                : "bg-ink-50 text-ink-950"
            }`}
          >
            {program?.enabled ? "Close program" : "Open program"}
          </button>
        </div>

        <div className="mt-4 flex items-end gap-3 rounded border border-ink-700 bg-ink-850 p-4">
          <div>
            <label className="text-xs text-ink-500">Default commission (%)</label>
            <input
              type="number"
              min={1}
              max={50}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="mt-1 block w-24 rounded border border-ink-600 px-2 py-1.5 text-sm"
            />
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="rounded bg-ink-50 px-4 py-1.5 text-sm text-ink-950 disabled:opacity-60"
          >
            Save
          </button>
          <p className="text-xs text-ink-400">
            Comes out of your margin — separate from the platform&rsquo;s 7% commission.
          </p>
        </div>

        {pending.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-medium text-ink-300">
              Pending applications ({pending.length})
            </h2>
            <ul className="mt-3 divide-y divide-ink-800 rounded border border-ink-700 bg-ink-850">
              {pending.map((e) => (
                <li key={e.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm">Creator {e.creator_id.slice(0, 8)}</p>
                    <p className="text-xs text-ink-500">
                      {e.product_id ? "Specific product" : "Whole store"} ·{" "}
                      {e.commission_rate}% commission
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(e.id, true)}
                      disabled={busyId === e.id}
                      className="rounded bg-ink-50 px-3 py-1.5 text-xs text-ink-950 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => respond(e.id, false)}
                      disabled={busyId === e.id}
                      className="rounded border border-ink-600 px-3 py-1.5 text-xs disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink-300">
            Active affiliates ({approved.length})
          </h2>
          {approved.length === 0 ? (
            <p className="mt-3 text-sm text-ink-400">No approved affiliates yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink-800 rounded border border-ink-700 bg-ink-850">
              {approved.map((e) => (
                <li key={e.id} className="flex items-center justify-between p-4 text-sm">
                  <span>Creator {e.creator_id.slice(0, 8)}</span>
                  <span className="text-ink-500">
                    {formatMRU(commissionTotals[e.creator_id] ?? 0)} earned
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
    </div>
  );
}
