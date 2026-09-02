import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
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
    <div>
      <Header
        back={{
          href: `/category/${set.categories.slug}`,
          label: set.categories.name_ml,
        }}
      />

      <div className="mx-auto max-w-2xl px-6 pb-8 pt-6">
        <h1 className="font-malayalam text-lg font-bold text-ink">
          {set.title_ml}
        </h1>
        <div className="mt-2 h-0.5 w-7 rounded bg-gold" />

        {set.description_ml && (
          <p className="mt-3 text-sm text-ink-muted">{set.description_ml}</p>
        )}

        {set.daily_type && <DailyMarkButton period={set.daily_type} />}

        <div className="mt-6">
          <SetReader items={items ?? []} setTitle={set.title_ml} />
        </div>
      </div>
    </div>
  );
}
