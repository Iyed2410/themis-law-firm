import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("staff auth security boundaries", () => {
  it("keeps service-role credentials out of client auth components and browser client", () => {
    const loginForm = readFileSync("src/components/auth/StaffLoginForm.tsx", "utf8");
    const browserClient = readFileSync("src/lib/supabase/browser.ts", "utf8");

    expect(loginForm).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(loginForm).not.toContain("@/lib/supabase/server");
    expect(browserClient).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("uses a cookie-aware server client for staff auth", () => {
    const serverClient = readFileSync("src/lib/supabase/ssr-server.ts", "utf8");

    expect(serverClient).toContain("@supabase/ssr");
    expect(serverClient).toContain("cookies");
    expect(serverClient).toContain("getAll");
    expect(serverClient).toContain("setAll");
  });

  it("exports a Next.js 16 proxy that refreshes sessions without final authorization", () => {
    const proxySource = readFileSync("src/proxy.ts", "utf8");

    expect(proxySource).toContain("export async function proxy");
    expect(proxySource).toContain("supabase.auth.getUser()");
    expect(proxySource).toContain("isUnauthenticatedAuthError");
    expect(proxySource).toContain("matcher");
    expect(proxySource).not.toContain("redirect(");
  });

  it("keeps obsolete fake auth identity env vars out of the tracked example", () => {
    const envExample = readFileSync(".env.example", "utf8");

    expect(envExample).not.toContain("STAFF_USER_ID");
    expect(envExample).not.toContain("STAFF_LAWYER_ID");
  });
});
