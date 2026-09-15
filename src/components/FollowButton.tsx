"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function FollowButton({ merchantId }: { merchantId: string }) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("merchant_id", merchantId)
        .maybeSingle();
      setFollowing(!!data);
    })();
  }, [merchantId]);

  async function toggle() {
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (following) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("merchant_id", merchantId);
      setFollowing(false);
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, merchant_id: merchantId });
      setFollowing(true);
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
        following
          ? "border border-ink-100 text-ink-100 hover:bg-ink-850"
          : "bg-ink-50 text-ink-950 hover:bg-ink-200"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
