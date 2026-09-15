import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

// TODO: update if a custom domain is ever attached to this project.
const BASE_URL = "https://marketplace-mauritania.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: products }, { data: merchants }] = await Promise.all([
    supabase.from("products").select("id, updated_at").order("updated_at", { ascending: false }).limit(5000),
    supabase.from("merchants").select("id, updated_at").order("updated_at", { ascending: false }).limit(1000),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/feed`, changeFrequency: "always", priority: 0.9 },
    { url: `${BASE_URL}/for-merchants`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/for-affiliates`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${BASE_URL}/product/${p.id}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const storeRoutes: MetadataRoute.Sitemap = (merchants ?? []).map((m) => ({
    url: `${BASE_URL}/store/${m.id}`,
    lastModified: m.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...storeRoutes];
}
