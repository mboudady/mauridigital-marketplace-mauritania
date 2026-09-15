import { createClient } from "@/lib/supabase/server";

export default async function LivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: followedMerchants } = user
    ? await supabase
        .from("follows")
        .select("merchants(id, store_name)")
        .eq("follower_id", user.id)
        .limit(10)
    : { data: [] };

  return (
    <main className="min-h-screen bg-ink-950 text-ink-50">
      <div className="safe-top mx-auto max-w-lg px-6 pt-8">
        <h1 className="font-display text-2xl">Live</h1>
        <p className="mt-2 text-sm text-ink-400">
          No one is live right now. Livestream selling isn&rsquo;t built yet —
          this page is ready for it, but the actual video broadcast
          infrastructure (real-time ingest, live chat, viewer counts) is a
          separate build.
        </p>

        {followedMerchants && followedMerchants.length > 0 && (
          <div className="mt-8">
            <p className="text-xs uppercase tracking-wide text-ink-500">
              Merchants you follow
            </p>
            <ul className="mt-3 divide-y divide-ink-800">
              {followedMerchants.map((f, i) => {
                const m = f.merchants as unknown as { id: string; store_name: string } | null;
                if (!m) return null;
                return (
                  <li key={i} className="flex items-center gap-3 py-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-800 font-display text-sm">
                      {m.store_name.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-sm">{m.store_name}</span>
                    <span className="ml-auto text-xs text-ink-500">Offline</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
