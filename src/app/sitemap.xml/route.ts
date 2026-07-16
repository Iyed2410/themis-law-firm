import { siteContent } from "@/lib/content";
import { getAbsoluteUrl, getSitemapPaths } from "@/lib/public-routes";

export function GET() {
  const urls = getSitemapPaths(siteContent.reviewsEnabled).map((path) =>
    getAbsoluteUrl(path)
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "content-type": "application/xml",
    },
  });
}
