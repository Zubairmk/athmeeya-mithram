import type { Metadata, Viewport } from "next";
import { Amiri, Noto_Sans_Malayalam, Outfit } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

const notoMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  variable: "--font-malayalam",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "ആത്മീയമിത്രം",
  description: "Daily Islamic dhikr/azkar — Spiritual Friend",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ആത്മീയമിത്രം",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E5C43",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ml"
      className={`${amiri.variable} ${notoMalayalam.variable} ${outfit.variable}`}
    >
      <body className="bg-paper font-sans text-ink">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
