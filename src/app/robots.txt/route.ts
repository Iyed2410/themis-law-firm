import { getAbsoluteUrl } from "@/lib/public-routes";

export function GET() {
  const content = `User-agent: *
Disallow:

Sitemap: ${getAbsoluteUrl("/sitemap.xml")}
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
