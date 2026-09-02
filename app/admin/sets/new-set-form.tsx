"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name_ml: string;
};

export default function NewSetForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [titleMl, setTitleMl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId || !titleMl.trim()) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/sets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ category_id: categoryId, title_ml: titleMl }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to create set");
      return;
    }

    const created = await res.json();
    router.push(`/admin/sets/${created.id}/edit`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded border border-white/10 p-4"
    >
      <div className="flex-1 space-y-1">
        <label className="block text-xs font-medium text-white/60">
          Category
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded border border-white/15 bg-transparent px-2 py-1.5 text-sm text-white outline-none focus:border-gold"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="text-ink">
              {c.name_ml}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-[2] space-y-1">
        <label className="block text-xs font-medium text-white/60">
          Set title (Malayalam)
        </label>
        <input
          value={titleMl}
          onChange={(e) => setTitleMl(e.target.value)}
          placeholder="e.g. സ്വലാത്തുന്നാരിയ്യ"
          className="w-full rounded border border-white/15 bg-transparent px-2 py-1.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-gold"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded border border-gold px-3 py-1.5 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-ink disabled:opacity-50"
      >
        {loading ? "Creating..." : "+ New Set"}
      </button>

      {error && <p className="w-full text-sm text-red-400">{error}</p>}
    </form>
  );
}
