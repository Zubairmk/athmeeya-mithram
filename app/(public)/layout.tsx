import { Amiri, Noto_Sans_Malayalam } from "next/font/google";

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

const notoMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  variable: "--font-malayalam",
});

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${amiri.variable} ${notoMalayalam.variable} min-h-screen bg-shell font-malayalam text-shell-muted`}
    >
      {children}
    </div>
  );
}
