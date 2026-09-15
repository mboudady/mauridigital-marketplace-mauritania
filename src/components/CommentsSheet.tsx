"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Comment = {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  display_name: string;
};

export function CommentsSheet({
  productId,
  onClose,
}: {
  productId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: rows } = await supabase
        .from("comments")
        .select("id, text, created_at, user_id")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      const userIds = [...new Set((rows ?? []).map((r) => r.user_id))];
      const { data: profiles } = userIds.length
        ? await supabase.from("user_profiles").select("user_id, display_name").in("user_id", userIds)
        : { data: [] };
      const nameByUser = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name]));

      setComments(
        (rows ?? []).map((r) => ({ ...r, display_name: nameByUser.get(r.user_id) ?? "User" }))
      );
      setLoading(false);
    })();
  }, [productId]);

  async function send() {
    if (!draft.trim()) return;
    setSending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { data, error } = await supabase
      .from("comments")
      .insert({ product_id: productId, user_id: user.id, text: draft.trim() })
      .select("id, text, created_at, user_id")
      .single();
    if (!error && data) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      setComments((c) => [{ ...data, display_name: profile?.display_name ?? "You" }, ...c]);
      setDraft("");
    }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="flex max-h-[70vh] w-full flex-col rounded-t-xl bg-ink-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-800 p-4">
          <p className="text-sm font-medium text-ink-50">
            {comments.length} comment{comments.length === 1 ? "" : "s"}
          </p>
          <button onClick={onClose} className="text-ink-400">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && <p className="text-sm text-ink-500">Loading…</p>}
          {!loading && comments.length === 0 && (
            <p className="text-sm text-ink-500">No comments yet. Be the first.</p>
          )}
          <ul className="space-y-4">
            {comments.map((c) => (
              <li key={c.id}>
                <p className="text-xs text-ink-400">
                  {c.display_name}
                </p>
                <p className="mt-0.5 text-sm text-ink-50">{c.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="safe-bottom flex items-center gap-2 border-t border-ink-800 p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Add a comment…"
            maxLength={500}
            className="flex-1 rounded-full border border-ink-600 bg-ink-900 px-4 py-2 text-sm text-ink-50 placeholder:text-ink-500 focus:border-ink-300 focus:outline-none"
          />
          <button
            onClick={send}
            disabled={sending || !draft.trim()}
            className="rounded-full bg-ink-50 px-4 py-2 text-sm font-medium text-ink-950 disabled:opacity-60"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
