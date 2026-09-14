"use client";

import { useState } from "react";
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
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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

    // Upload images (best-effort; product still exists even if an image fails)
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

    router.push("/merchant/products");
  }

  return (
    <main className="min-h-screen bg-sand-50 px-6 py-12 text-indigo-900">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl">Add a product</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Product name
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-sand-300 bg-white px-3 py-2 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded border border-sand-300 bg-white px-3 py-2 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="text-sm font-medium">
                Price (MRU)
              </label>
              <input
                id="price"
                type="number"
                min={1}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="3000"
                className="mt-1 w-full rounded border border-sand-300 bg-white px-3 py-2 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label htmlFor="stock" className="text-sm font-medium">
                Stock
              </label>
              <input
                id="stock"
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1 w-full rounded border border-sand-300 bg-white px-3 py-2 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Description{" "}
              <span className="font-normal text-sand-400">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded border border-sand-300 bg-white px-3 py-2 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label htmlFor="images" className="text-sm font-medium">
              Photos{" "}
              <span className="font-normal text-sand-400">
                (first photo is the cover)
              </span>
            </label>
            <input
              id="images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="mt-1 w-full text-sm text-sand-600 file:mr-3 file:rounded file:border-0 file:bg-indigo-100 file:px-3 file:py-1.5 file:text-sm file:text-indigo-700"
            />
            <p className="mt-1 text-xs text-sand-400">
              Video uploads are coming once the platform&rsquo;s video
              hosting is connected — photos work now.
            </p>
          </div>

          {status === "error" && (
            <p className="text-sm text-clay-500">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full rounded bg-indigo-600 px-4 py-2.5 text-sm font-medium text-sand-50 transition-colors hover:bg-indigo-500 disabled:opacity-60"
          >
            {status === "saving" ? "Publishing…" : "Publish product"}
          </button>
        </form>
      </div>
    </main>
  );
}
