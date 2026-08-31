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
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dhikr Sets</h1>
        <Link href="/admin/dashboard" className="text-sm text-gray-500">
          &larr; Dashboard
        </Link>
      </div>

      <NewSetForm categories={categories ?? []} />

      <div className="mt-8 space-y-8">
        {(categories ?? []).map((category) => (
          <section key={category.id}>
            <h2 className="mb-2 text-sm font-semibold text-gray-500">
              {category.name_ml}
            </h2>
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
              {(setsByCategory.get(category.id) ?? []).map((set) => (
                <li
                  key={set.id}
                  className="flex items-center justify-between py-3"
                >
                  <Link
                    href={`/admin/sets/${set.id}/edit`}
                    className="text-sm font-medium hover:underline"
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
                <li className="py-3 text-sm text-gray-400">No sets yet.</li>
              )}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
