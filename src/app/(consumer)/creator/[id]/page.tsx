import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { CreatorFollowButton } from "@/components/CreatorFollowButton";

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name, avatar_url, bio")
    .eq("user_id", id)
    .maybeSingle();

  if (!profile) notFound();

  const { data: posts } = await supabase
    .from("creator_posts")
    .select("id, view_count, like_count, product_id, creator_post_media(url, is_hero, type)")
    .eq("creator_id", id)
    .order("created_at", { ascending: false });

  const { count: followerCount } = await supabase
    .from("creator_follows")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", id);

  return (
    <main className="min-h-screen bg-ink-950 pb-24 text-ink-50">
      <div className="safe-top mx-auto max-w-5xl px-6 pt-8 sm:px-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-ink-800 font-display text-xl">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                profile.display_name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="font-display text-xl">{profile.display_name}</h1>
              <p className="text-sm text-ink-400">{followerCount ?? 0} followers</p>
            </div>
          </div>
          <CreatorFollowButton creatorId={id} />
        </div>

        {profile.bio && <p className="mt-4 max-w-lg text-sm text-ink-300">{profile.bio}</p>}

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {(posts ?? []).map((post) => {
            const media = (post.creator_post_media ?? []) as Array<{
              url: string;
              is_hero: boolean | null;
              type: string;
            }>;
            const hero =
              media.find((m) => m.is_hero && m.type === "image") ??
              media.find((m) => m.type === "image");
            const hasVideo = media.some((m) => m.type === "video");
            return (
              <Link
                key={post.id}
                href={`/product/${post.product_id}`}
                className="relative aspect-[9/16] overflow-hidden rounded bg-ink-850"
              >
                {hero ? (
                  <Image src={hero.url} alt="" fill sizes="200px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-ink-500">
                    No image
                  </div>
                )}
                {hasVideo && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white">
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
                      <path d="M1 0.5L9 5L1 9.5V0.5Z" />
                    </svg>
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        {!posts?.length && (
          <p className="mt-10 text-center text-sm text-ink-500">No posts yet.</p>
        )}
      </div>
    </main>
  );
}
