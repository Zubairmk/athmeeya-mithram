import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

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
    <div className="mx-auto max-w-2xl px-6 pb-16 pt-8">
      <Link href="/" className="text-sm text-shell-muted/70">
        &larr; ആത്മീയമിത്രം
      </Link>

      <h1 className="mt-4 font-malayalam text-xl font-semibold text-shell-muted">
        {category.name_ml}
      </h1>

      <ul className="mt-6 divide-y divide-shell-muted/15 border-y border-shell-muted/15">
        {(sets ?? []).map((set) => (
          <li key={set.id}>
            <Link
              href={`/set/${set.id}`}
              className="block py-4 text-sm text-shell-muted transition-colors hover:text-manuscript"
            >
              {set.title_ml}
            </Link>
          </li>
        ))}
        {(sets ?? []).length === 0 && (
          <li className="py-4 text-sm text-shell-muted/50">
            ഇവിടെ ഇതുവരെ പ്രസിദ്ധീകരിച്ചിട്ടില്ല.
          </li>
        )}
      </ul>
    </div>
  );
}
