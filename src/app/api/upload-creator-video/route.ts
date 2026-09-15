import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;

  if (!libraryId || !apiKey) {
    return NextResponse.json(
      { error: "Video hosting isn't configured yet." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const postId = formData.get("postId") as string | null;

  if (!file || !postId) {
    return NextResponse.json({ error: "Missing file or postId" }, { status: 400 });
  }

  // Verify the caller actually owns this creator post before spending any
  // Bunny API calls or storage on their behalf.
  const { data: post } = await supabase
    .from("creator_posts")
    .select("id, creator_id, products(name)")
    .eq("id", postId)
    .maybeSingle();

  if (!post || post.creator_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (file.size > 500 * 1024 * 1024) {
    return NextResponse.json({ error: "Video must be under 500MB" }, { status: 400 });
  }

  try {
    const title = (post.products as unknown as { name: string } | null)?.name ?? "Creator post";

    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: "POST",
        headers: { AccessKey: apiKey, Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      }
    );
    if (!createRes.ok) throw new Error(`Bunny create-video failed: ${await createRes.text()}`);

    const created = (await createRes.json()) as { guid: string };
    const videoId = created.guid;

    const uploadRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: "PUT",
        headers: { AccessKey: apiKey, "Content-Type": "application/octet-stream" },
        body: file.stream(),
        // @ts-expect-error -- required by undici for streaming request bodies
        duplex: "half",
      }
    );
    if (!uploadRes.ok) throw new Error(`Bunny upload failed: ${await uploadRes.text()}`);

    await supabase.from("creator_post_media").insert({
      post_id: postId,
      type: "video",
      video_provider: "bunny",
      video_external_id: videoId,
      url: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`,
      is_hero: false,
      display_order: 0,
    });

    return NextResponse.json({ videoId });
  } catch (err) {
    console.error("Creator video upload error:", err);
    return NextResponse.json({ error: "Video upload failed. Try again." }, { status: 500 });
  }
}
