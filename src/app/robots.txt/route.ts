export function GET() {
  const content = `User-agent: *
Disallow:

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
