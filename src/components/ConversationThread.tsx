"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export function ConversationThread({
  conversationId,
  backHref,
}: {
  conversationId: string;
  backHref: string;
}) {
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [headerTitle, setHeaderTitle] = useState("Conversation");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setMyUserId(user.id);

    const { data: convo } = await supabase
      .from("conversations")
      .select("customer_id, merchant_id, merchants(store_name, user_id)")
      .eq("id", conversationId)
      .maybeSingle();

    if (convo) {
      const merchant = convo.merchants as unknown as {
        store_name: string;
        user_id: string;
      } | null;
      setHeaderTitle(
        user.id === merchant?.user_id ? "Customer" : merchant?.store_name ?? "Seller"
      );
    }

    const { data: msgs } = await supabase
      .from("messages")
      .select("id, sender_id, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(msgs ?? []);

    // Mark incoming messages as read
    await supabase
      .from("messages")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("recipient_id", user.id)
      .eq("read", false);
  }, [conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!draft.trim() || !myUserId) return;
    setSending(true);
    const supabase = createClient();

    const { data: convo } = await supabase
      .from("conversations")
      .select("customer_id, merchants(user_id)")
      .eq("id", conversationId)
      .maybeSingle();

    const merchant = convo?.merchants as unknown as { user_id: string } | null;
    const recipientId =
      myUserId === convo?.customer_id ? merchant?.user_id : convo?.customer_id;

    if (recipientId) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: myUserId,
        recipient_id: recipientId,
        content: draft.trim(),
      });
      setDraft("");
      await load();
    }
    setSending(false);
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-ink-950">
      <div className="safe-top flex items-center gap-3 border-b border-ink-800 px-4 py-3">
        <Link href={backHref} className="text-ink-400">
          ←
        </Link>
        <p className="font-medium text-ink-50">{headerTitle}</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender_id === myUserId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                m.sender_id === myUserId
                  ? "bg-spark-500 text-ink-50"
                  : "bg-ink-850 text-ink-100"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="safe-bottom flex items-center gap-2 border-t border-ink-800 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message…"
          className="flex-1 rounded-full border border-ink-600 bg-ink-850 px-4 py-2 text-sm text-ink-50 placeholder:text-ink-500 focus:border-spark-500 focus:outline-none"
        />
        <button
          onClick={send}
          disabled={sending || !draft.trim()}
          className="rounded-full bg-spark-500 px-4 py-2 text-sm text-ink-50 disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
}
