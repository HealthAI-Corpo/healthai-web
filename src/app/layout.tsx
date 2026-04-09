import type { Metadata } from "next";
import { QueryProvider } from "@/lib/providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s — HealthAI Coach Admin",
    default: "HealthAI Coach — Plateforme d'administration",
  },
  description:
    "Backend d'administration HealthAI Coach : monitoring des pipelines, analytics utilisateurs et gestion des données.",
  robots: "noindex, nofollow", // interface interne
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        {/* Skip link — RGAA AA */}
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
