import type { MetadataRoute } from "next";

const BASE_URL = "https://marketplace-mauritania.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/orders",
          "/notifications",
          "/messages",
          "/profile",
          "/saved",
          "/affiliate",
          "/merchant",
          "/admin",
          "/onboarding",
          "/login",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
