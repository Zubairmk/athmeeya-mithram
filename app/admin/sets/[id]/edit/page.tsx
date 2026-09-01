import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    <main className="min-h-screen bg-shell">
      <div className="mx-auto max-w-3xl p-8">
        <Link href="/admin/sets" className="text-sm text-shell-muted/60">
          &larr; All sets
        </Link>

        <h1 className="mb-6 mt-2 text-lg font-semibold text-shell-muted">
          {set.title_ml}
        </h1>

        <SetMetaForm set={set} categories={categories ?? []} />

        <h2 className="mb-3 mt-10 text-sm font-semibold text-shell-muted/70">
          Items
        </h2>
        <ItemsList setId={id} initialItems={items ?? []} />
      </div>
    </main>
  );
}
