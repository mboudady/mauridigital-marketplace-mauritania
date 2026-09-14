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
    <main className="min-h-screen bg-sand-50 px-6 py-12 text-indigo-900 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl">Messages</h1>

        {!loading && conversations.length === 0 && (
          <p className="mt-10 text-center text-sand-500">
            No customer messages yet.
          </p>
        )}

        <ul className="mt-6 divide-y divide-sand-200 rounded border border-sand-200 bg-white">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/merchant/messages/${c.id}`}
                className="flex items-center justify-between p-4 hover:bg-sand-50"
              >
                <span className="text-sm">Customer</span>
                {c.last_message_at && (
                  <span className="text-xs text-sand-500">
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
