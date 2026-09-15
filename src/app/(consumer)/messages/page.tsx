"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ConversationRow = {
  id: string;
  last_message_at: string | null;
  merchants: { store_name: string } | null;
};

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("conversations")
        .select("id, last_message_at, merchants(store_name)")
        .eq("customer_id", user.id)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      setConversations((data as unknown as ConversationRow[]) ?? []);
      setLoading(false);
    })();
  }, [router]);

  return (
    <main className="min-h-screen bg-ink-950 text-ink-100">
      <div className="safe-top mx-auto max-w-2xl px-6 pt-6 sm:px-10">
        <h1 className="font-display text-2xl text-ink-50">Messages</h1>

        {!loading && conversations.length === 0 && (
          <p className="mt-10 text-center text-ink-400">
            No conversations yet. Message a seller from any product page.
          </p>
        )}

        <ul className="mt-6 divide-y divide-ink-800">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                className="flex items-center justify-between py-4"
              >
                <span>{c.merchants?.store_name ?? "Seller"}</span>
                {c.last_message_at && (
                  <span className="text-xs text-ink-500">
                    {new Date(c.last_message_at).toLocaleDateString()}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
