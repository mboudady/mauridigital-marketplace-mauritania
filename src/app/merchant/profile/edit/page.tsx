"use client";

import { useEffect, useState } from "react";
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

export default function EditMerchantProfilePage() {
  const router = useRouter();
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
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
        .select("id, store_name, category, description, logo_url, banner_url")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!merchant) {
        router.push("/onboarding");
        return;
      }
      setMerchantId(merchant.id);
      setStoreName(merchant.store_name);
      setCategory(merchant.category);
      setDescription(merchant.description ?? "");
      setLogoUrl(merchant.logo_url);
      setBannerUrl(merchant.banner_url);
      setLoading(false);
    })();
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!merchantId) return;
    setSaving(true);

    const supabase = createClient();
    let newLogoUrl = logoUrl;
    let newBannerUrl = bannerUrl;

    if (logoFile) {
      const path = `${merchantId}/logo-${Date.now()}.${logoFile.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("merchant-branding").upload(path, logoFile, { upsert: true });
      if (!error) {
        newLogoUrl = supabase.storage.from("merchant-branding").getPublicUrl(path).data.publicUrl;
      }
    }
    if (bannerFile) {
      const path = `${merchantId}/banner-${Date.now()}.${bannerFile.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("merchant-branding").upload(path, bannerFile, { upsert: true });
      if (!error) {
        newBannerUrl = supabase.storage.from("merchant-branding").getPublicUrl(path).data.publicUrl;
      }
    }

    await supabase
      .from("merchants")
      .update({
        store_name: storeName,
        category,
        description: description || null,
        logo_url: newLogoUrl,
        banner_url: newBannerUrl,
      })
      .eq("id", merchantId);

    setSaving(false);
    setSaved(true);
    setTimeout(() => router.push("/merchant/dashboard"), 800);
  }

  if (loading) return <main className="min-h-screen bg-ink-950" />;

  return (
    <main className="min-h-screen bg-ink-950 px-6 py-10 text-ink-50">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl">Edit store profile</h1>

        <form onSubmit={save} className="mt-6 space-y-5">
          <div>
            <label className="text-xs text-ink-400">Banner</label>
            <label className="mt-1 block aspect-[3/1] cursor-pointer overflow-hidden rounded border border-dashed border-ink-600 bg-ink-850">
              {bannerFile ? (
                <Image src={URL.createObjectURL(bannerFile)} alt="" width={400} height={133} className="h-full w-full object-cover" />
              ) : bannerUrl ? (
                <Image src={bannerUrl} alt="" width={400} height={133} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-ink-500">Tap to add banner</div>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-ink-600 bg-ink-850">
              {logoFile ? (
                <Image src={URL.createObjectURL(logoFile)} alt="" width={64} height={64} className="h-full w-full object-cover" />
              ) : logoUrl ? (
                <Image src={logoUrl} alt="" width={64} height={64} className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] text-ink-500">Logo</span>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
            </label>
            <p className="text-xs text-ink-500">Tap to change your store logo</p>
          </div>

          <div>
            <label htmlFor="storeName" className="text-xs text-ink-400">Store name</label>
            <input
              id="storeName"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="mt-1 w-full rounded border border-ink-600 bg-ink-850 px-3 py-2 text-sm focus:border-ink-100 focus:outline-none focus:ring-1 focus:ring-ink-100"
            />
          </div>

          <div>
            <label htmlFor="category" className="text-xs text-ink-400">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded border border-ink-600 bg-ink-850 px-3 py-2 text-sm focus:border-ink-100 focus:outline-none focus:ring-1 focus:ring-ink-100"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="text-xs text-ink-400">Description</label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded border border-ink-600 bg-ink-850 px-3 py-2 text-sm focus:border-ink-100 focus:outline-none focus:ring-1 focus:ring-ink-100"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded bg-ink-50 px-4 py-2.5 text-sm font-medium text-ink-950 disabled:opacity-60"
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
