"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "ഹോം",
    icon: (
      <path d="M3 11l9-8 9 8M5 10v10h14V10" />
    ),
  },
  {
    href: "/streak",
    label: "പുരോഗതി",
    icon: (
      <path d="M4 19V13M10 19V9M16 19V5M4 13l6-4 6-3" />
    ),
  },
  {
    href: "/settings",
    label: "ക്രമീകരണം",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
  },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-line bg-surface/95 px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 px-2 py-1 text-[10.5px] font-semibold transition-colors ${
              active ? "text-green" : "text-ink-faint"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {tab.icon}
            </svg>
            <span className="font-malayalam">{tab.label}</span>
            <span
              className={`h-[3px] w-[3px] rounded-full transition-colors ${
                active ? "bg-gold" : "bg-transparent"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
