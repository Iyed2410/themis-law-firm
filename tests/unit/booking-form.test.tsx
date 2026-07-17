import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BookingRequestForm } from "@/components/booking/BookingRequestForm";

const expertiseOptions = [{ value: "droit-civil", label: "Droit civil" }];
const lawyerOptions = [{ value: "no_preference", label: "Sans preference" }];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BookingRequestForm", () => {
  it("renders a native POST fallback to the booking endpoint", async () => {
    const { container, unmount } = await renderForm();
    const form = container.querySelector("form");

    expect(form?.getAttribute("method")).toBe("post");
    expect(form?.getAttribute("action")).toBe("/api/booking-requests");
    expect(form?.getAttribute("method")).not.toBe("get");

    unmount();
  });

  it("prevents native GET navigation and leaves booking fields out of the URL", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ code: "BOOKING_SERVER_ERROR" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    );
    window.history.replaceState(null, "", "/fr/rendez-vous");
    const { container, unmount } = await renderForm();
    const form = container.querySelector("form");

    if (!form) {
      throw new Error("Booking form was not rendered.");
    }

    const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
    let dispatchResult = true;

    await act(async () => {
      dispatchResult = form.dispatchEvent(submitEvent);
    });

    expect(dispatchResult).toBe(false);
    expect(submitEvent.defaultPrevented).toBe(true);
    expect(window.location.href).toBe("http://localhost:3000/fr/rendez-vous");
    expect(window.location.search).toBe("");
    expect(window.location.href).not.toContain("email=");
    expect(window.location.href).not.toContain("telephone=");
    expect(window.location.href).not.toContain("reason=");
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/booking-requests",
      expect.objectContaining({ method: "POST" })
    );

    unmount();
  });
});

async function renderForm() {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <BookingRequestForm
        locale="fr"
        expertiseOptions={expertiseOptions}
        lawyerOptions={lawyerOptions}
      />
    );
  });

  return {
    container,
    unmount() {
      root.unmount();
      container.remove();
    },
  };
}
