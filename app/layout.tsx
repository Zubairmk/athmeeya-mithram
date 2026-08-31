import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ആത്മീയമിത്രം",
  description: "Daily Islamic dhikr/azkar — Spiritual Friend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ml">
      <body>{children}</body>
    </html>
  );
}
