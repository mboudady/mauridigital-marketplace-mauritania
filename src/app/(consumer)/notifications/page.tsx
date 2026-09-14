"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: { order_id?: string; conversation_id?: string; refund_id?: string } | null;
  read: boolean | null;
  created_at: string;
};

function linkFor(n: Notification): string | null {
  if (n.data?.conversation_id) return `/messages/${n.data.conversation_id}`;
  if (n.data?.order_id) return `/orders/${n.data.order_id}`;
  return null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
        .from("notifications")
        .select("id, type, title, body, data, read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setNotifications((data as unknown as Notification[]) ?? []);
      setLoading(false);

      const unreadIds = (data ?? []).filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length > 0) {
        await supabase.from("notifications").update({ read: true, read_at: new Date().toISOString() }).in("id", unreadIds);
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen bg-indigo-900 pb-24 text-sand-100">
      <div className="safe-top mx-auto max-w-2xl px-6 pt-6 sm:px-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-sand-50">Notifications</h1>
          <div className="flex gap-3 text-xs text-sand-400">
            <Link href="/messages" className="underline">
              Messages
            </Link>
            <Link href="/saved" className="underline">
              Saved
            </Link>
          </div>
        </div>

        {!loading && notifications.length === 0 && (
          <p className="mt-10 text-center text-sand-400">Nothing yet.</p>
        )}

        <ul className="mt-6 divide-y divide-indigo-700">
          {notifications.map((n) => {
            const href = linkFor(n);
            const content = (
              <div className={`py-3 ${n.read ? "opacity-70" : ""}`}>
                <p className="text-sm text-sand-50">{n.title}</p>
                {n.body && <p className="text-xs text-sand-400">{n.body}</p>}
                <p className="mt-1 text-[10px] text-sand-500">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            );
            return (
              <li key={n.id}>
                {href ? <Link href={href}>{content}</Link> : content}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
