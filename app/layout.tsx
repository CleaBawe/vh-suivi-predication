import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suivi Prédication — Classe 4",
  description:
    "Plateforme de suivi et d'entraînement à la prédication — Vases d'Honneur, Campus Afrique",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
