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
      <div className="grid grid-cols-2 gap-3">
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
      <p className="mt-4 text-center text-xs text-shell-muted">
        <span className="font-semibold text-gold">{streak}</span> ദിവസം
        സ്ട്രീക്ക്
      </p>
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
      className={`flex flex-col items-center justify-center gap-2 rounded border py-6 ${
        done ? "border-gold" : "border-shell-muted/25"
      }`}
    >
      <span className="text-sm font-medium text-shell-muted">{label}</span>
      {done && <span className="text-gold">✓</span>}
    </div>
  );

  if (!href) {
    return <div className="opacity-40">{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}
