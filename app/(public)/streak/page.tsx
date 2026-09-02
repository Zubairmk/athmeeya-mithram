"use client";

import { useEffect, useState } from "react";
import { loadState, getRecentDays, type StreakState } from "@/lib/streak";
import BrandLink from "@/components/BrandLink";

const WEEKDAY_FORMAT = new Intl.DateTimeFormat("ml", { weekday: "short" });
const DATE_FORMAT = new Intl.DateTimeFormat("ml", { day: "numeric", month: "short" });

export default function StreakPage() {
  const [state, setState] = useState<StreakState | null>(null);
  const [days, setDays] = useState<ReturnType<typeof getRecentDays>>([]);

  useEffect(() => {
    setState(loadState());
    setDays(getRecentDays(30));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16 pt-8">
      <BrandLink href="/" label="ആത്മീയമിത്രം" />

      <h1 className="mt-4 font-malayalam text-xl font-semibold text-shell-muted">
        എന്റെ പുരോഗതി
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded border border-shell-muted/25 py-6 text-center">
          <p className="text-3xl font-semibold text-gold">
            {state?.streak.current ?? 0}
          </p>
          <p className="mt-1 text-xs text-shell-muted">നിലവിലെ സ്ട്രീക്ക്</p>
        </div>
        <div className="rounded border border-shell-muted/25 py-6 text-center">
          <p className="text-3xl font-semibold text-shell-muted">
            {state?.streak.longest ?? 0}
          </p>
          <p className="mt-1 text-xs text-shell-muted">ഏറ്റവും ദൈർഘ്യമേറിയത്</p>
        </div>
      </div>

      <h2 className="mb-2 mt-10 text-sm font-semibold text-shell-muted">
        കഴിഞ്ഞ 30 ദിവസം
      </h2>
      <ul className="divide-y divide-shell-muted/15 border-y border-shell-muted/15">
        {days.map((day) => (
          <li
            key={day.date}
            className="flex items-center justify-between py-2.5 text-sm"
          >
            <span className="text-shell-muted">
              {DATE_FORMAT.format(new Date(day.date))}{" "}
              <span className="text-xs">
                ({WEEKDAY_FORMAT.format(new Date(day.date))})
              </span>
            </span>
            <span className="flex items-center gap-3 text-xs">
              <Dot label="രാവിലെ" done={day.morning} />
              <Dot label="വൈകുന്നേരം" done={day.evening} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Dot({ label, done }: { label: string; done: boolean }) {
  return (
    <span className="flex items-center gap-1">
      <span
        className={`h-2 w-2 rounded-full ${done ? "bg-gold" : "bg-shell-muted/25"}`}
      />
      <span className={done ? "text-gold" : "text-shell-muted"}>
        {label}
      </span>
    </span>
  );
}
