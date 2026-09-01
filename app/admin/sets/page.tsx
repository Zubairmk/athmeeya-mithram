import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NewSetForm from "./new-set-form";
import PublishToggle from "./publish-toggle";

export default async function AdminSetsPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: sets }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("dhikr_sets")
      .select("*, categories(name_ml)")
      .order("sort_order"),
  ]);

  const setsByCategory = new Map<string, typeof sets>();
  for (const set of sets ?? []) {
    const list = setsByCategory.get(set.category_id) ?? [];
    list.push(set);
    setsByCategory.set(set.category_id, list);
  }

  return (
    <main className="min-h-screen bg-shell">
      <div className="mx-auto max-w-3xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gold">
              ആത്മീയമിത്രം
            </p>
            <h1 className="mt-1 text-lg font-semibold text-shell-muted">
              Dhikr Sets
            </h1>
          </div>
          <Link href="/admin/dashboard" className="text-sm text-shell-muted/60">
            &larr; Dashboard
          </Link>
        </div>

        <NewSetForm categories={categories ?? []} />

        <div className="mt-8 space-y-8">
          {(categories ?? []).map((category) => (
            <section key={category.id}>
              <h2 className="mb-2 text-sm font-semibold text-shell-muted/70">
                {category.name_ml}
              </h2>
              <ul className="divide-y divide-shell-muted/15 border-y border-shell-muted/15">
                {(setsByCategory.get(category.id) ?? []).map((set) => (
                  <li
                    key={set.id}
                    className="flex items-center justify-between py-3"
                  >
                    <Link
                      href={`/admin/sets/${set.id}/edit`}
                      className="text-sm font-medium text-shell-muted hover:text-manuscript"
                    >
                      {set.title_ml}
                    </Link>
                    <PublishToggle
                      setId={set.id}
                      isPublished={set.is_published}
                    />
                  </li>
                ))}
                {(setsByCategory.get(category.id) ?? []).length === 0 && (
                  <li className="py-3 text-sm text-shell-muted/40">
                    No sets yet.
                  </li>
                )}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
