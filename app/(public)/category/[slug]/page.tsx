import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name_ml")
    .eq("slug", slug)
    .single();

  return { title: category ? `${category.name_ml} — ആത്മീയമിത്രം` : "ആത്മീയമിത്രം" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) {
    notFound();
  }

  const { data: sets } = await supabase
    .from("dhikr_sets")
    .select("*")
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("sort_order");

  return (
    <div className="pb-28">
      <Header back={{ href: "/", label: "തിരികെ" }} />

      <div className="mx-auto max-w-2xl px-6 pb-8 pt-6">
        <h1 className="font-malayalam text-lg font-bold text-ink">
          {category.name_ml}
        </h1>
        <div className="mt-2 h-0.5 w-7 rounded bg-gold" />

        <ul className="mt-5 divide-y divide-line border-y border-line">
          {(sets ?? []).map((set) => (
            <li key={set.id}>
              <Link
                href={`/set/${set.id}`}
                className="flex items-center justify-between py-3.5 text-[13.5px] font-medium text-ink transition-colors hover:text-green"
              >
                {set.title_ml}
                <span className="text-green">&rsaquo;</span>
              </Link>
            </li>
          ))}
          {(sets ?? []).length === 0 && (
            <li className="py-4 text-sm text-ink-muted">
              ഇവിടെ ഇതുവരെ പ്രസിദ്ധീകരിച്ചിട്ടില്ല.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
