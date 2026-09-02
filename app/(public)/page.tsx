import { createClient } from "@/lib/supabase/server";
import CategoryNav from "@/components/CategoryNav";
import StreakTracker from "@/components/StreakTracker";
import Logo from "@/components/Logo";
import { formatHijriDate } from "@/lib/hijri";

const GREGORIAN_FORMAT = new Intl.DateTimeFormat("ml", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

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

  const today = new Date();

  return (
    <div className="pb-28">
      <div className="relative overflow-hidden bg-gradient-to-br from-green-deep via-green to-[#135C43] px-6 pb-8 pt-11">
        <GeometricLattice />
        <div className="relative mx-auto max-w-2xl">
          <Logo className="mx-auto h-10 w-10 text-gold-light" />
          <h1 className="mt-3 text-center font-malayalam text-xl font-extrabold text-white">
            ആത്മീയമിത്രം
          </h1>
          <div className="mx-auto mt-3 h-px w-9 bg-gradient-to-r from-transparent via-gold-light to-transparent" />

          <div className="mt-5 flex justify-center gap-2">
            <DatePill label="ഹിജ്‌റ" value={formatHijriDate(today)} />
            <DatePill label="ഗ്രിഗോറിയൻ" value={GREGORIAN_FORMAT.format(today)} />
          </div>

          <div className="mt-5 rounded-2xl bg-white p-4 shadow-lg shadow-black/20">
            <StreakTracker
              morningSet={morningSets?.[0] ?? null}
              eveningSet={eveningSets?.[0] ?? null}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 pt-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-faint">
          വിഭാഗങ്ങൾ
        </p>
        <CategoryNav categories={categories ?? []} />
      </div>
    </div>
  );
}

function DatePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gold-light/25 bg-white/10 px-3 py-1.5 text-center">
      <p className="text-[8.5px] font-bold uppercase tracking-wide text-gold-light">
        {label}
      </p>
      <p className="mt-0.5 whitespace-nowrap text-[11px] font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function GeometricLattice() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-full w-full opacity-[0.14]"
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="#E7C77E" strokeWidth="0.7" fill="none">
        <path d="M0 20 L25 45 L0 70 M50 20 L75 45 L50 70 M100 20 L125 45 L100 70 M150 20 L175 45 L150 70 M200 20 L225 45 L200 70 M250 20 L275 45 L250 70 M300 20 L325 45 L300 70 M350 20 L375 45 L350 70 M400 20 L425 45 L400 70" />
      </g>
    </svg>
  );
}
