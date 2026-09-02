"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadState, todayCompletion } from "@/lib/streak";

type DailySet = { id: string; title_ml: string } | null;

export default function StreakTracker({
  morningSet,
  eveningSet,
}: {
  morningSet: DailySet;
  eveningSet: DailySet;
}) {
  const [completion, setCompletion] = useState({ morning: false, evening: false });
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const state = loadState();
    setCompletion(todayCompletion(state));
    setStreak(state.streak.current);
  }, []);

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-green-deep">{streak}</span>
        <span className="text-xs text-ink-muted">ദിവസം സ്ട്രീക്ക്</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <Tile
          label="രാവിലെ"
          done={completion.morning}
          href={morningSet ? `/set/${morningSet.id}` : null}
        />
        <Tile
          label="വൈകുന്നേരം"
          done={completion.evening}
          href={eveningSet ? `/set/${eveningSet.id}` : null}
        />
      </div>
    </div>
  );
}

function Tile({
  label,
  done,
  href,
}: {
  label: string;
  done: boolean;
  href: string | null;
}) {
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3.5 ${
        done ? "border-gold bg-gold-soft" : "border-line"
      }`}
    >
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      {done && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] text-white">
          ✓
        </span>
      )}
    </div>
  );

  if (!href) {
    return <div className="opacity-40">{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}
