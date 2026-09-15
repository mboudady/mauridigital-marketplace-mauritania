"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CreatorFollowButton({ creatorId }: { creatorId: string }) {
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
        .from("creator_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("creator_id", creatorId)
        .maybeSingle();
      setFollowing(!!data);
    })();
  }, [creatorId]);

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
    if (user.id === creatorId) {
      setBusy(false);
      return;
    }

    if (following) {
      await supabase
        .from("creator_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("creator_id", creatorId);
      setFollowing(false);
    } else {
      await supabase.from("creator_follows").insert({ follower_id: user.id, creator_id: creatorId });
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
          ? "border border-ink-500 text-ink-100"
          : "bg-ink-50 text-ink-950"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
