import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Server-side only — never expose BUNNY_STREAM_API_KEY to the client.
// Video provider is abstracted behind product_media.video_provider so a
// future move to Cloudflare Stream only needs a new branch here, not a
// schema change or a client-side rewrite.

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
  const productId = formData.get("productId") as string | null;

  if (!file || !productId) {
    return NextResponse.json(
      { error: "Missing file or productId" },
      { status: 400 }
    );
  }

  // Verify the caller's merchant actually owns this product before spending
  // any Bunny API calls or storage on their behalf.
  const { data: product } = await supabase
    .from("products")
    .select("id, name, merchant_id, merchants(user_id)")
    .eq("id", productId)
    .maybeSingle();

  const ownsProduct =
    product &&
    (product.merchants as unknown as { user_id: string } | null)?.user_id ===
      user.id;

  if (!ownsProduct) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (file.size > 500 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Video must be under 500MB" },
      { status: 400 }
    );
  }

  try {
    // Step 1: create the video "slot" in the library
    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: apiKey,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: product.name }),
      }
    );

    if (!createRes.ok) {
      const text = await createRes.text();
      throw new Error(`Bunny create-video failed: ${text}`);
    }

    const created = (await createRes.json()) as { guid: string };
    const videoId = created.guid;

    // Step 2: upload the actual file bytes
    const uploadRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: "PUT",
        headers: {
          AccessKey: apiKey,
          "Content-Type": "application/octet-stream",
        },
        body: file.stream(),
        // @ts-expect-error -- required by undici for streaming request bodies
        duplex: "half",
      }
    );

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      throw new Error(`Bunny upload failed: ${text}`);
    }

    // Record it against the product. Videos take a little time to encode on
    // Bunny's side, but the embed URL works as soon as the upload completes.
    const { count: existingMediaCount } = await supabase
      .from("product_media")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId);

    await supabase.from("product_media").insert({
      product_id: productId,
      type: "video",
      video_provider: "bunny",
      video_external_id: videoId,
      url: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`,
      is_hero: false,
      display_order: existingMediaCount ?? 0,
    });

    return NextResponse.json({ videoId });
  } catch (err) {
    console.error("Video upload error:", err);
    return NextResponse.json(
      { error: "Video upload failed. Try again." },
      { status: 500 }
    );
  }
}
