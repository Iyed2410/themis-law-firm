import type { Metadata } from "next";
import { Cinzel, Inter, Noto_Kufi_Arabic } from "next/font/google";
import "../globals.css";
import { validateFoundationEnv } from "@/lib/env";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoKufi = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Themis Law Firm — Saadaoui & Haddad",
  description:
    "Site institutionnel bilingue pour le cabinet Themis Law Firm — Saadaoui & Haddad.",
};

validateFoundationEnv();

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" className={`${cinzel.variable} ${inter.variable} ${notoKufi.variable} min-h-full bg-ivory text-black`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
