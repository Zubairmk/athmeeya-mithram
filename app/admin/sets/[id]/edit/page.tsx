import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import SetMetaForm from "./set-meta-form";
import ItemsList from "./items-list";

export default async function EditSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: set }, { data: categories }, { data: items }] =
    await Promise.all([
      supabase.from("dhikr_sets").select("*").eq("id", id).single(),
      supabase.from("categories").select("*").order("sort_order"),
      supabase
        .from("dhikr_items")
        .select("*")
        .eq("set_id", id)
        .order("sort_order"),
    ]);

  if (!set) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-ink font-sans">
      <div className="mx-auto max-w-3xl p-8">
        <Link href="/admin/sets" className="text-sm text-white/60">
          &larr; All sets
        </Link>

        <p className="mt-4 flex items-center gap-1.5 text-xs uppercase tracking-wide text-gold">
          <Logo className="h-3.5 w-3.5" />
          ആത്മീയമിത്രം
        </p>
        <h1 className="mb-6 mt-1 text-lg font-semibold text-white">
          {set.title_ml}
        </h1>

        <SetMetaForm set={set} categories={categories ?? []} />

        <h2 className="mb-3 mt-10 text-sm font-semibold text-white/80">
          Items
        </h2>
        <ItemsList setId={id} initialItems={items ?? []} />
      </div>
    </main>
  );
}
