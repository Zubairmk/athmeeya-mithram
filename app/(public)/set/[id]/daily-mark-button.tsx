"use client";

import { useEffect, useState } from "react";
import {
  loadState,
  toggleCompletion,
  todayCompletion,
  type DailyPeriod,
} from "@/lib/streak";

export default function DailyMarkButton({ period }: { period: DailyPeriod }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(todayCompletion(loadState())[period]);
  }, [period]);

  function handleToggle() {
    const state = toggleCompletion(period);
    setDone(todayCompletion(state)[period]);
  }

  return (
    <button
      onClick={handleToggle}
      className={`mt-4 rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
        done
          ? "border-green bg-green text-white"
          : "border-line text-ink-muted"
      }`}
    >
      {done ? "✓ ഇന്ന് പൂർത്തിയാക്കി" : "ഇന്ന് പൂർത്തിയാക്കിയതായി അടയാളപ്പെടുത്തുക"}
    </button>
  );
}
