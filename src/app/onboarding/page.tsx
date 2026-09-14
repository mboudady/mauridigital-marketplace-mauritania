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

export default function OnboardingPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
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

    const { error } = await supabase.from("merchants").insert({
      user_id: user.id,
      store_name: storeName,
      category,
      description: description || null,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(
        error.code === "23505"
          ? "You already have a store."
          : error.message
      );
      return;
    }

    router.push("/merchant/dashboard");
  }

  return (
    <main className="min-h-screen bg-sand-50 px-6 py-16 text-indigo-900">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl">Set up your store</h1>
        <p className="mt-2 text-sm text-indigo-500">
          Free to open. You only pay a 7% commission when you make a sale.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="storeName" className="text-sm font-medium">
              Store name
            </label>
            <input
              id="storeName"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Boutique Amal"
              className="mt-1 w-full rounded border border-sand-300 bg-white px-3 py-2 text-indigo-900 placeholder:text-sand-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label htmlFor="category" className="text-sm font-medium">
              Main category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded border border-sand-300 bg-white px-3 py-2 text-indigo-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Description{" "}
              <span className="font-normal text-sand-400">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What do you sell, and what makes your store worth following?"
              className="mt-1 w-full rounded border border-sand-300 bg-white px-3 py-2 text-indigo-900 placeholder:text-sand-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-clay-500">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full rounded bg-indigo-600 px-4 py-2.5 text-sm font-medium text-sand-50 transition-colors hover:bg-indigo-500 disabled:opacity-60"
          >
            {status === "saving" ? "Creating store…" : "Create store"}
          </button>
        </form>
      </div>
    </main>
  );
}
