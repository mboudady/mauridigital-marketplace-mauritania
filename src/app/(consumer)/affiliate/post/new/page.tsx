"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IMAGE_FILTERS, applyFilterToImage, applyFilterToVideo, type ImageFilterId } from "@/lib/imageFilters";

type Eligible = { enrollmentId: string; productId: string; productName: string };

export default function NewCreatorPostPage() {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [eligible, setEligible] = useState<Eligible[]>([]);
  const [productId, setProductId] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [filterId, setFilterId] = useState<ImageFilterId>("normal");
  const [videoProcessing, setVideoProcessing] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
        .from("affiliate_enrollments")
        .select("id, product_id, status, products(id, name)")
        .eq("creator_id", user.id)
        .eq("status", "approved")
        .not("product_id", "is", null);

      const list = (data ?? [])
        .map((e) => ({
          enrollmentId: e.id,
          productId: e.product_id as string,
          productName: (e.products as unknown as { name: string } | null)?.name ?? "Product",
        }))
        .filter((e) => e.productId);
      setEligible(list);
      if (list.length) setProductId(list[0].productId);
      setLoading(false);
    })();
  }, [router]);

  const previewUrl = videoFile
    ? URL.createObjectURL(videoFile)
    : files[0]
      ? URL.createObjectURL(files[0])
      : null;

  function addHashtag() {
    const clean = hashtagInput.trim().replace(/^#/, "").toLowerCase();
    if (clean && !hashtags.includes(clean)) setHashtags((h) => [...h, clean]);
    setHashtagInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return;
    setStatus("saving");
    setErrorMessage("");

    const supabase = createClient();
    const { data: postId, error: postError } = await supabase.rpc("create_creator_post", {
      p_product_id: productId,
      p_caption: caption || null,
    });

    if (postError || !postId) {
      setStatus("error");
      setErrorMessage(postError?.message ?? "Could not create post.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    for (let i = 0; i < files.length; i++) {
      const file = await applyFilterToImage(files[i], filterId);
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/${postId}/${i}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("creator-media")
        .upload(path, file, { upsert: true });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("creator-media").getPublicUrl(path);
        await supabase.from("creator_post_media").insert({
          post_id: postId,
          type: "image",
          url: urlData.publicUrl,
          is_hero: i === 0,
          display_order: i,
        });
      }
    }

    for (const tag of hashtags) {
      const clean = tag.replace(/^#/, "").toLowerCase();
      if (!/^[a-z0-9_]{1,50}$/.test(clean)) continue;
      const { data: hashtagRow } = await supabase
        .from("hashtags")
        .upsert({ tag: clean }, { onConflict: "tag" })
        .select("id")
        .single();
      if (hashtagRow) {
        await supabase.from("creator_post_hashtags").insert({ post_id: postId, hashtag_id: hashtagRow.id });
      }
    }

    if (videoFile) {
      setVideoProcessing(true);
      const processedVideo = await applyFilterToVideo(videoFile, filterId, setVideoProgress);
      setVideoProcessing(false);
      const body = new FormData();
      body.append("file", processedVideo);
      body.append("postId", postId);
      try {
        await fetch("/api/upload-creator-video", { method: "POST", body });
      } catch {
        // Swallow — post already created with photos, if any.
      }
    }

    router.push("/affiliate");
  }

  if (loading) return <main className="min-h-screen bg-ink-950" />;

  if (eligible.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center text-ink-50">
        <p className="font-display text-xl">No products to post about yet</p>
        <p className="mt-2 max-w-xs text-sm text-ink-400">
          Apply to a merchant&rsquo;s affiliate program from any product page
          first — once approved, you can post here.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink-950 text-ink-50">
      <form onSubmit={handleSubmit}>
        <div className="mx-auto flex max-w-md flex-col items-center pt-6">
          <div
            onClick={() => !previewUrl && imageInputRef.current?.click()}
            className="relative aspect-[9/16] w-56 overflow-hidden rounded-xl border border-ink-700 bg-ink-900"
          >
            {videoFile ? (
              <video
                src={previewUrl!}
                className="h-full w-full object-cover"
                muted
                loop
                autoPlay
                playsInline
                style={{ filter: IMAGE_FILTERS.find((f) => f.id === filterId)?.css }}
              />
            ) : files[0] ? (
              <Image
                src={previewUrl!}
                alt=""
                fill
                sizes="224px"
                className="object-cover"
                style={{ filter: IMAGE_FILTERS.find((f) => f.id === filterId)?.css }}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-400">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="9" cy="10" r="2" />
                  <path d="M21 16l-5-5-9 9" />
                </svg>
                <span className="text-xs">Tap to choose cover</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => imageInputRef.current?.click()} className="rounded-full border border-ink-600 px-4 py-1.5 text-xs text-ink-100">
              {files.length > 0 ? `${files.length} photo${files.length > 1 ? "s" : ""}` : "Add photos"}
            </button>
            <button type="button" onClick={() => videoInputRef.current?.click()} className="rounded-full border border-ink-600 px-4 py-1.5 text-xs text-ink-100">
              {videoFile ? "Video selected" : "Add video"}
            </button>
          </div>
          <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} className="hidden" />
          <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} className="hidden" />

          {(files.length > 0 || videoFile) && (
            <div className="mt-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {IMAGE_FILTERS.map((f) => (
                <button key={f.id} type="button" onClick={() => setFilterId(f.id)} className="flex shrink-0 flex-col items-center gap-1.5">
                  <div className={`relative h-12 w-12 overflow-hidden rounded-full border-2 ${filterId === f.id ? "border-ink-50" : "border-transparent"}`}>
                    {videoFile ? (
                      <video src={previewUrl!} muted playsInline className="h-full w-full object-cover" style={{ filter: f.css }} />
                    ) : (
                      <Image src={previewUrl!} alt="" fill sizes="48px" className="object-cover" style={{ filter: f.css }} />
                    )}
                  </div>
                  <span className={`text-[10px] ${filterId === f.id ? "text-ink-50" : "text-ink-500"}`}>{f.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto mt-6 max-w-md space-y-5 px-6 pb-16">
          <div>
            <label htmlFor="product" className="text-xs text-ink-400">Which product is this about?</label>
            <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="mt-1 w-full rounded border border-ink-600 bg-ink-850 px-3 py-2 text-sm focus:border-ink-100 focus:outline-none focus:ring-1 focus:ring-ink-100"
            >
              {eligible.map((p) => (
                <option key={p.productId} value={p.productId}>{p.productName}</option>
              ))}
            </select>
          </div>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            placeholder="Write a caption..."
            className="w-full resize-none border-0 border-b border-ink-700 bg-transparent pb-2 text-base placeholder:text-ink-500 focus:border-ink-100 focus:outline-none"
          />

          <div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-ink-800 px-3 py-1 text-xs text-ink-50">
                  #{tag}
                  <button type="button" onClick={() => setHashtags((h) => h.filter((t) => t !== tag))} className="text-ink-400">×</button>
                </span>
              ))}
            </div>
            <input
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " " || e.key === ",") { e.preventDefault(); addHashtag(); } }}
              onBlur={addHashtag}
              placeholder="Add hashtags…"
              className="mt-2 w-full rounded border border-ink-600 bg-ink-850 px-3 py-2 text-sm placeholder:text-ink-500 focus:border-ink-100 focus:outline-none focus:ring-1 focus:ring-ink-100"
            />
          </div>

          {status === "error" && <p className="text-sm text-red-400">{errorMessage}</p>}

          {videoProcessing && (
            <div>
              <p className="text-xs text-ink-400">
                Applying filter to video… ({Math.round(videoProgress * 100)}%)
              </p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
                <div className="h-full bg-ink-50 transition-all" style={{ width: `${videoProgress * 100}%` }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "saving" || videoProcessing}
            className="w-full rounded-full bg-ink-50 px-4 py-3 text-sm font-medium text-ink-950 disabled:opacity-60"
          >
            {videoProcessing ? "Processing video…" : status === "saving" ? "Posting…" : "Post"}
          </button>
        </div>
      </form>
    </main>
  );
}
