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
      className={`mt-4 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
        done
          ? "border-gold bg-gold text-shell"
          : "border-shell-muted/40 text-shell-muted"
      }`}
    >
      {done ? "✓ ഇന്ന് പൂർത്തിയാക്കി" : "ഇന്ന് പൂർത്തിയാക്കിയതായി അടയാളപ്പെടുത്തുക"}
    </button>
  );
}
