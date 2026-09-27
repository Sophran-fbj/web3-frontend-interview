import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = getAbsoluteUrl("/sitemap.xml");

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: process.env.CONTENT_PREVIEW === "true" ? undefined : sitemapUrl,
  };
}
