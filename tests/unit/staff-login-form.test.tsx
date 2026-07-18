import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StaffLoginForm, StaffLogoutButton } from "@/components/auth/StaffLoginForm";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("StaffLoginForm", () => {
  it("submits valid email/password credentials and navigates to a safe dashboard path", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    const onNavigate = vi.fn();
    const { container, unmount } = await render(
      <StaffLoginForm
        nextPath="/dashboard/calendar"
        clientFactory={() => ({ auth: { signInWithPassword, signOut: vi.fn() } })}
        onNavigate={onNavigate}
      />,
    );

    fillInput(container, "email", "admin@example.com");
    fillInput(container, "password", "correct-password");

    await submit(container);

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "correct-password",
    });
    expect(onNavigate).toHaveBeenCalledWith("/dashboard/calendar");
    unmount();
  });

  it("shows a safe invalid-credential error without navigating", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: { message: "Invalid login credentials" } });
    const onNavigate = vi.fn();
    const { container, unmount } = await render(
      <StaffLoginForm
        clientFactory={() => ({ auth: { signInWithPassword, signOut: vi.fn() } })}
        onNavigate={onNavigate}
      />,
    );

    fillInput(container, "email", "admin@example.com");
    fillInput(container, "password", "wrong-password");

    await submit(container);

    expect(container.textContent).toContain("Adresse email ou mot de passe incorrect.");
    expect(container.textContent).not.toContain("Invalid login credentials");
    expect(onNavigate).not.toHaveBeenCalled();
    unmount();
  });

  it("sanitizes unsafe redirect targets before navigation", async () => {
    const onNavigate = vi.fn();
    const { container, unmount } = await render(
      <StaffLoginForm
        nextPath="https://evil.example"
        clientFactory={() => ({
          auth: {
            signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
            signOut: vi.fn(),
          },
        })}
        onNavigate={onNavigate}
      />,
    );

    fillInput(container, "email", "admin@example.com");
    fillInput(container, "password", "correct-password");

    await submit(container);

    expect(onNavigate).toHaveBeenCalledWith("/dashboard");
    unmount();
  });
});

describe("StaffLogoutButton", () => {
  it("signs out and returns to the login page", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });
    const onNavigate = vi.fn();
    const { container, unmount } = await render(
      <StaffLogoutButton
        clientFactory={() => ({ auth: { signInWithPassword: vi.fn(), signOut } })}
        onNavigate={onNavigate}
      />,
    );

    await act(async () => {
      container.querySelector("button")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(signOut).toHaveBeenCalled();
    expect(onNavigate).toHaveBeenCalledWith("/auth/login");
    unmount();
  });
});

async function render(node: React.ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(node);
  });

  return {
    container,
    unmount() {
      root.unmount();
      container.remove();
    },
  };
}

function fillInput(container: Element, name: string, value: string) {
  const input = container.querySelector<HTMLInputElement>(`input[name="${name}"]`);

  if (!input) {
    throw new Error(`Missing input ${name}`);
  }

  input.value = value;
}

async function submit(container: Element) {
  const form = container.querySelector("form");

  if (!form) {
    throw new Error("Missing login form");
  }

  await act(async () => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}
