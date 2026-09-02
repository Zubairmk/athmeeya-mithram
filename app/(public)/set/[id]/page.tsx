import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import SetReader from "./set-reader";
import DailyMarkButton from "./daily-mark-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: set } = await supabase
    .from("dhikr_sets")
    .select("title_ml")
    .eq("id", id)
    .single();

  return { title: set ? `${set.title_ml} — ആത്മീയമിത്രം` : "ആത്മീയമിത്രം" };
}

export default async function SetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: set } = await supabase
    .from("dhikr_sets")
    .select("*, categories(slug, name_ml)")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (!set) {
    notFound();
  }

  const { data: items } = await supabase
    .from("dhikr_items")
    .select("*")
    .eq("set_id", id)
    .order("sort_order");

  return (
    <div className="min-h-screen bg-manuscript text-ink">
      <div className="mx-auto max-w-2xl px-6 pt-8">
        <div className="rounded border border-ink/15 p-5">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              aria-label="ആത്മീയമിത്രം"
              className="flex items-center gap-1.5 text-ink-muted transition-colors hover:text-gold-ink"
            >
              <Logo className="h-4 w-4" />
            </Link>
            <Link
              href={`/category/${set.categories.slug}`}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              &larr; {set.categories.name_ml}
            </Link>
          </div>

          <h1 className="mt-5 font-malayalam text-xl font-semibold text-ink">
            {set.title_ml}
          </h1>
          <div className="mt-2 h-px w-10 bg-gold" />

          {set.description_ml && (
            <p className="mt-3 text-sm text-ink-muted">{set.description_ml}</p>
          )}

          {set.daily_type && <DailyMarkButton period={set.daily_type} />}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <span className="h-px flex-1 bg-gold/40" />
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            ഉള്ളടക്കം
          </span>
          <span className="h-px flex-1 bg-gold/40" />
        </div>

        <div className="mt-6">
          <SetReader items={items ?? []} setTitle={set.title_ml} />
        </div>
      </div>
    </div>
  );
}
