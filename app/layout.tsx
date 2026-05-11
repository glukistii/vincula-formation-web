import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vincula Formation - Lecteur Vidéo",
  description: "Plateforme de formations vidéo et e-commerce",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
