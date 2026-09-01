import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
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
        <Link
          href={`/category/${set.categories.slug}`}
          className="text-sm text-ink-muted"
        >
          &larr; {set.categories.name_ml}
        </Link>

        <h1 className="mt-4 font-malayalam text-xl font-semibold text-ink">
          {set.title_ml}
        </h1>
        {set.description_ml && (
          <p className="mt-1 text-sm text-ink-muted">{set.description_ml}</p>
        )}

        {set.daily_type && <DailyMarkButton period={set.daily_type} />}

        <div className="mt-8">
          <SetReader items={items ?? []} setTitle={set.title_ml} />
        </div>
      </div>
    </div>
  );
}
