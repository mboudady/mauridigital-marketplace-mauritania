"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "counterfeit", label: "Counterfeit product" },
  { value: "scam", label: "Scam or fraud" },
  { value: "harassment", label: "Harassment" },
  { value: "illegal", label: "Illegal item" },
  { value: "other", label: "Other" },
];

export function ReportButton({
  contentType,
  contentId,
}: {
  contentType: "product" | "merchant" | "review" | "comment" | "user";
  contentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function submit() {
    setStatus("sending");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("reports").insert({
      reporter_id: user?.id ?? null,
      content_type: contentType,
      content_id: contentId,
      reason,
      description: description || null,
    });

    setStatus("sent");
  }

  if (status === "sent") {
    return <p className="text-xs text-ink-500">Thanks — we&rsquo;ll review this.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-ink-500 hover:text-red-400"
      >
        Report this {contentType}
      </button>
    );
  }

  return (
    <div className="rounded border border-ink-600 bg-ink-850 p-3 text-xs">
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded border border-ink-600 px-2 py-1.5"
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Details (optional)"
        rows={2}
        className="mt-2 w-full rounded border border-ink-600 px-2 py-1.5"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={submit}
          disabled={status === "sending"}
          className="rounded bg-spark-500 px-3 py-1 text-ink-50 disabled:opacity-60"
        >
          Submit report
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded border border-ink-600 px-3 py-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
