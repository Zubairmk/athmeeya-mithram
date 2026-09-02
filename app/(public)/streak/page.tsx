"use client";

import { useEffect, useState } from "react";
import { loadState, getRecentDays, type StreakState } from "@/lib/streak";
import Header from "@/components/Header";

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
    <div className="pb-28">
      <Header back={{ href: "/", label: "ഹോം" }} />

      <div className="mx-auto max-w-2xl px-6 pb-8 pt-6">
        <h1 className="font-malayalam text-lg font-bold text-ink">
          എന്റെ പുരോഗതി
        </h1>
        <div className="mt-2 h-0.5 w-7 rounded bg-gold" />

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line py-6 text-center">
            <p className="text-3xl font-extrabold text-green-deep">
              {state?.streak.current ?? 0}
            </p>
            <p className="mt-1 text-xs text-ink-muted">നിലവിലെ സ്ട്രീക്ക്</p>
          </div>
          <div className="rounded-xl border border-line py-6 text-center">
            <p className="text-3xl font-extrabold text-ink">
              {state?.streak.longest ?? 0}
            </p>
            <p className="mt-1 text-xs text-ink-muted">ഏറ്റവും ദൈർഘ്യമേറിയത്</p>
          </div>
        </div>

        <h2 className="mb-2 mt-8 text-sm font-bold text-ink">
          കഴിഞ്ഞ 30 ദിവസം
        </h2>
        <ul className="divide-y divide-line border-y border-line">
          {days.map((day) => (
            <li
              key={day.date}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <span className="text-ink-muted">
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
    </div>
  );
}

function Dot({ label, done }: { label: string; done: boolean }) {
  return (
    <span className="flex items-center gap-1">
      <span
        className={`h-2 w-2 rounded-full ${done ? "bg-green" : "bg-line"}`}
      />
      <span className={done ? "text-green-deep" : "text-ink-muted"}>
        {label}
      </span>
    </span>
  );
}
