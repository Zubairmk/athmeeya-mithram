import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CategoryNav from "@/components/CategoryNav";
import StreakTracker from "@/components/StreakTracker";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: morningSets }, { data: eveningSets }] =
    await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase
        .from("dhikr_sets")
        .select("id, title_ml")
        .eq("daily_type", "morning")
        .eq("is_published", true)
        .order("sort_order")
        .limit(1),
      supabase
        .from("dhikr_sets")
        .select("id, title_ml")
        .eq("daily_type", "evening")
        .eq("is_published", true)
        .order("sort_order")
        .limit(1),
    ]);

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16">
      <header className="relative overflow-hidden pb-8 pt-12 text-center">
        <GeometricMotif />
        <Link
          href="/settings"
          aria-label="ക്രമീകരണങ്ങൾ"
          className="absolute right-0 top-4 text-shell-muted/60"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
        <h1 className="font-malayalam text-2xl font-semibold text-manuscript">
          ആത്മീയമിത്രം
        </h1>
      </header>

      <StreakTracker
        morningSet={morningSets?.[0] ?? null}
        eveningSet={eveningSets?.[0] ?? null}
      />

      <div className="mt-10">
        <CategoryNav categories={categories ?? []} />
      </div>
    </div>
  );
}

function GeometricMotif() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full w-full opacity-[0.07]"
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="#C79A46" strokeWidth="1" fill="none">
        <path d="M0 100 L50 50 L100 100 L150 50 L200 100 L250 50 L300 100 L350 50 L400 100" />
        <path d="M0 100 L50 150 L100 100 L150 150 L200 100 L250 150 L300 100 L350 150 L400 100" />
      </g>
    </svg>
  );
}
