"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "Fashion",
  "Beauty & cosmetics",
  "Perfumes",
  "Shoes",
  "Electronics & accessories",
  "Jewelry",
  "Home & kitchen",
  "Fitness & wellness",
  "Baby products",
  "Other",
];

export default function NewProductPage() {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [files, setFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const previewUrl = videoFile
    ? URL.createObjectURL(videoFile)
    : files[0]
      ? URL.createObjectURL(files[0])
      : null;

  function addHashtag() {
    const clean = hashtagInput.trim().replace(/^#/, "").toLowerCase();
    if (clean && !hashtags.includes(clean)) {
      setHashtags((h) => [...h, clean]);
    }
    setHashtagInput("");
  }

  function removeHashtag(tag: string) {
    setHashtags((h) => h.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage("");

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

    const priceNum = parseInt(price, 10);
    const stockNum = parseInt(stock, 10);

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        merchant_id: merchant.id,
        name,
        description: description || null,
        category,
        price_mru: priceNum,
      })
      .select("id")
      .single();

    if (productError || !product) {
      setStatus("error");
      setErrorMessage(productError?.message ?? "Could not create product.");
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const path = `${merchant.id}/${product.id}/${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);

        await supabase.from("product_media").insert({
          product_id: product.id,
          type: "image",
          url: urlData.publicUrl,
          is_hero: i === 0,
          display_order: i,
        });
      }
    }

    await supabase.from("inventory").insert({
      product_id: product.id,
      quantity_total: stockNum,
    });

    for (const tag of hashtags) {
      await supabase.rpc("attach_hashtag", { p_product_id: product.id, p_tag: tag });
    }

    if (videoFile) {
      const body = new FormData();
      body.append("file", videoFile);
      body.append("productId", product.id);
      try {
        await fetch("/api/upload-video", { method: "POST", body });
      } catch {
        // Swallow — product creation already succeeded.
      }
    }

    router.push("/merchant/products");
  }

  return (
    <main className="min-h-screen bg-ink-950 text-ink-50">
      <form onSubmit={handleSubmit}>
        {/* Media preview - TikTok-style 9:16 frame */}
        <div className="mx-auto flex max-w-md flex-col items-center pt-6">
          <div
            onClick={() => !previewUrl && imageInputRef.current?.click()}
            className="relative aspect-[9/16] w-56 overflow-hidden rounded-xl border border-ink-700 bg-ink-900"
          >
            {videoFile ? (
              <video src={previewUrl!} className="h-full w-full object-cover" muted loop autoPlay playsInline />
            ) : files[0] ? (
              <Image src={previewUrl!} alt="" fill sizes="224px" className="object-cover" />
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
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="rounded-full border border-ink-600 px-4 py-1.5 text-xs text-ink-100"
            >
              {files.length > 0 ? `${files.length} photo${files.length > 1 ? "s" : ""}` : "Add photos"}
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="rounded-full border border-ink-600 px-4 py-1.5 text-xs text-ink-100"
            >
              {videoFile ? "Video selected" : "Add video"}
            </button>
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />

          {files.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto px-4">
              {files.map((f, i) => (
                <div key={i} className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-ink-700">
                  <Image src={URL.createObjectURL(f)} alt="" fill sizes="56px" className="object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-[9px]">cover</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Caption + details */}
        <div className="mx-auto mt-6 max-w-md space-y-5 px-6 pb-16">
          <textarea
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            rows={2}
            placeholder="Write a caption... (this is your product name)"
            className="w-full resize-none border-0 border-b border-ink-700 bg-transparent pb-2 text-base placeholder:text-ink-500 focus:border-spark-500 focus:outline-none"
          />

          <div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-ink-800 px-3 py-1 text-xs text-spark-400">
                  #{tag}
                  <button type="button" onClick={() => removeHashtag(tag)} className="text-ink-400">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " " || e.key === ",") {
                  e.preventDefault();
                  addHashtag();
                }
              }}
              onBlur={addHashtag}
              placeholder="Add hashtags — #handbag #summer…"
              className="mt-2 w-full rounded border border-ink-600 bg-ink-850 px-3 py-2 text-sm placeholder:text-ink-500 focus:border-spark-500 focus:outline-none focus:ring-1 focus:ring-spark-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="text-xs text-ink-400">Price (MRU)</label>
              <input
                id="price"
                type="number"
                min={1}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="3000"
                className="mt-1 w-full rounded border border-ink-600 bg-ink-850 px-3 py-2 text-sm focus:border-spark-500 focus:outline-none focus:ring-1 focus:ring-spark-500"
              />
            </div>
            <div>
              <label htmlFor="stock" className="text-xs text-ink-400">Stock</label>
              <input
                id="stock"
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1 w-full rounded border border-ink-600 bg-ink-850 px-3 py-2 text-sm focus:border-spark-500 focus:outline-none focus:ring-1 focus:ring-spark-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="text-xs text-ink-400">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded border border-ink-600 bg-ink-850 px-3 py-2 text-sm focus:border-spark-500 focus:outline-none focus:ring-1 focus:ring-spark-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="text-xs text-ink-400">
              More details <span className="text-ink-500">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded border border-ink-600 bg-ink-850 px-3 py-2 text-sm focus:border-spark-500 focus:outline-none focus:ring-1 focus:ring-spark-500"
            />
          </div>

          {status === "error" && <p className="text-sm text-red-400">{errorMessage}</p>}

          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full rounded-full bg-spark-500 px-4 py-3 text-sm font-medium text-ink-50 transition-colors hover:bg-spark-400 disabled:opacity-60"
          >
            {status === "saving" ? "Posting…" : "Post"}
          </button>
        </div>
      </form>
    </main>
  );
}
