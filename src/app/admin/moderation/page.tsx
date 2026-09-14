"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Report = {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description: string | null;
  status: string | null;
  created_at: string;
};

const ACTIONS = [
  { value: "approved", label: "Dismiss (no issue found)" },
  { value: "content_removed", label: "Remove content" },
  { value: "user_warned", label: "Warn the seller" },
  { value: "merchant_suspended", label: "Suspend seller (7 days)" },
  { value: "user_banned", label: "Ban seller permanently" },
];

export default function ModerationPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<Record<string, string>>(
    {}
  );

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const admin = roles?.some((r) => r.role === "admin" || r.role === "moderator");
    setIsAdmin(!!admin);
    if (!admin) return;

    const { data } = await supabase
      .from("reports")
      .select("id, content_type, content_id, reason, description, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    setReports(data ?? []);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(reportId: string) {
    const action = selectedAction[reportId] ?? "approved";
    setBusyId(reportId);
    const supabase = createClient();
    await supabase.rpc("admin_resolve_report", {
      p_report_id: reportId,
      p_action: action,
      p_reason: null,
      p_suspend_days: 7,
    });
    await load();
    setBusyId(null);
  }

  if (isAdmin === null) {
    return <main className="min-h-screen bg-sand-50" />;
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sand-50 text-indigo-900">
        <p className="text-sm text-sand-500">
          This account doesn&rsquo;t have moderation access.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sand-50 px-6 py-12 text-indigo-900 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl">Moderation queue</h1>
        <p className="mt-1 text-sm text-sand-500">
          {reports.length} pending report{reports.length === 1 ? "" : "s"}
        </p>

        {reports.length === 0 ? (
          <p className="mt-10 text-center text-sand-400">
            Nothing waiting for review.
          </p>
        ) : (
          <ul className="mt-8 space-y-4">
            {reports.map((r) => (
              <li
                key={r.id}
                className="rounded border border-sand-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-sand-500">
                    {r.content_type} · {r.reason}
                  </span>
                  <span className="text-xs text-sand-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.description && (
                  <p className="mt-2 text-sm text-indigo-800">
                    {r.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-sand-400">
                  Content ID: {r.content_id}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={selectedAction[r.id] ?? "approved"}
                    onChange={(e) =>
                      setSelectedAction((s) => ({
                        ...s,
                        [r.id]: e.target.value,
                      }))
                    }
                    className="rounded border border-sand-300 px-2 py-1.5 text-sm"
                  >
                    {ACTIONS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => resolve(r.id)}
                    disabled={busyId === r.id}
                    className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-sand-50 hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {busyId === r.id ? "Applying…" : "Apply"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
