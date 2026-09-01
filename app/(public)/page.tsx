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
