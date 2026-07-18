"use client";

import { useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { DEFAULT_STAFF_REDIRECT_PATH, getSafeStaffRedirectPath } from "@/lib/auth/redirect";

type StaffLoginClient = {
  auth: {
    signInWithPassword: (credentials: {
      email: string;
      password: string;
    }) => Promise<{ error: { message?: string } | null }>;
    signOut: () => Promise<{ error: { message?: string } | null }>;
  };
};

type StaffLoginFormProps = {
  nextPath?: string;
  clientFactory?: () => StaffLoginClient | null;
  onNavigate?: (path: string) => void;
};

export function StaffLoginForm({
  nextPath = DEFAULT_STAFF_REDIRECT_PATH,
  clientFactory = createSupabaseBrowserClient,
  onNavigate = (path) => window.location.assign(path),
}: StaffLoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const client = clientFactory();

    if (!client) {
      setError("La configuration d’authentification est indisponible.");
      setIsSubmitting(false);
      return;
    }

    const { error: signInError } = await client.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Adresse email ou mot de passe incorrect.");
      setIsSubmitting(false);
      return;
    }

    onNavigate(getSafeStaffRedirectPath(nextPath));
  }

  return (
    <form className="mt-8 grid gap-5" method="post" onSubmit={handleSubmit}>
      {error ? (
        <p className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <label className="grid gap-2 text-sm font-medium text-navy">
        Adresse email
        <input
          className="rounded border border-silver/60 bg-white px-4 py-3 text-base text-black outline-none focus:border-gold"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-navy">
        Mot de passe
        <input
          className="rounded border border-silver/60 bg-white px-4 py-3 text-base text-black outline-none focus:border-gold"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>

      <button
        className="rounded bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

type StaffLogoutButtonProps = {
  clientFactory?: () => StaffLoginClient | null;
  onNavigate?: (path: string) => void;
};

export function StaffLogoutButton({
  clientFactory = createSupabaseBrowserClient,
  onNavigate = (path) => window.location.assign(path),
}: StaffLogoutButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const client = clientFactory();

    if (client) {
      await client.auth.signOut();
    }

    onNavigate("/auth/login");
  }

  return (
    <button
      className="rounded border border-silver/60 px-4 py-2 text-sm font-semibold text-navy transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-60"
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
    >
      {isSubmitting ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );
}
