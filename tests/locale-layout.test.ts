import { describe, expect, it } from "vitest";
import { getAlternatePath, getLocaleDirection, isSupportedLocale } from "../src/lib/locale";
import { localeContent } from "../src/lib/content";

describe("locale utilities", () => {
  it("validates supported locales", () => {
    expect(isSupportedLocale("fr")).toBe(true);
    expect(isSupportedLocale("ar")).toBe(true);
    expect(isSupportedLocale("en")).toBe(false);
    expect(isSupportedLocale("")).toBe(false);
    expect(isSupportedLocale(undefined)).toBe(false);
  });

  it("maps equivalent paths between fr and ar", () => {
    expect(getAlternatePath("/fr", "ar")).toBe("/ar");
    expect(getAlternatePath("/ar", "fr")).toBe("/fr");
    expect(getAlternatePath("/fr/expertises", "ar")).toBe("/ar/expertises");
    expect(getAlternatePath("/ar/booking", "fr")).toBe("/fr/booking");
  });

  it("returns ltr for fr and rtl for ar", () => {
    expect(getLocaleDirection("fr")).toBe("ltr");
    expect(getLocaleDirection("ar")).toBe("rtl");
  });
});

describe("firm configuration", () => {
  it("contains a French footer address and telephone", () => {
    expect(localeContent.fr.footer.address).toBeTruthy();
    expect(localeContent.fr.footer.phone).toMatch(/^\+216/);
  });

  it("contains an Arabic footer address and telephone", () => {
    expect(localeContent.ar.footer.address).toBeTruthy();
    expect(localeContent.ar.footer.phone).toMatch(/^\+216/);
  });
});
