import { AuthSessionMissingError } from "@supabase/supabase-js";

const unauthenticatedAuthCodes = new Set([
  "session_not_found",
  "session_expired",
  "refresh_token_not_found",
  "refresh_token_already_used",
]);

function getStringProperty(error: unknown, property: "name" | "code" | "message"): string | null {
  if (!error || typeof error !== "object" || !(property in error)) {
    return null;
  }

  const value = (error as Record<string, unknown>)[property];

  return typeof value === "string" ? value : null;
}

export function isUnauthenticatedAuthError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  if (error instanceof AuthSessionMissingError) {
    return true;
  }

  const name = getStringProperty(error, "name");
  const code = getStringProperty(error, "code");
  const message = getStringProperty(error, "message")?.toLowerCase() ?? "";

  return (
    name === "AuthSessionMissingError" ||
    Boolean(code && unauthenticatedAuthCodes.has(code)) ||
    message.includes("auth session missing") ||
    message.includes("invalid jwt") ||
    message.includes("jwt expired")
  );
}
