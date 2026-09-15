"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ConversationRow = {
  id: string;
  last_message_at: string | null;
  customer_id: string;
};

export default function MerchantMessagesPage() {
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

      const { data } = await supabase
        .from("conversations")
        .select("id, last_message_at, customer_id")
        .eq("merchant_id", merchant.id)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      setConversations(data ?? []);
      setLoading(false);
    })();
  }, [router]);

  return (
    <div>
      {!loading && conversations.length === 0 && (
        <p className="mt-10 text-center text-ink-500">
          No customer messages yet.
        </p>
      )}

      <ul className="divide-y divide-ink-800 rounded border border-ink-700 bg-ink-850">
        {conversations.map((c) => (
          <li key={c.id}>
            <Link
              href={`/merchant/messages/${c.id}`}
              className="flex items-center justify-between p-4 hover:bg-ink-950"
            >
              <span className="text-sm">Customer</span>
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
  );
}
