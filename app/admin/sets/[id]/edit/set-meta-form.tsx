"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name_ml: string };
type Set = {
  id: string;
  category_id: string;
  title_ml: string;
  title_ar: string | null;
  description_ml: string | null;
  is_published: boolean;
  daily_type: "morning" | "evening" | null;
};

const inputClass =
  "w-full rounded border border-shell-muted/25 bg-transparent px-2 py-1.5 text-sm text-shell-muted outline-none placeholder:text-shell-muted/30 focus:border-gold";
const labelClass = "block text-xs font-medium text-shell-muted";

export default function SetMetaForm({
  set,
  categories,
}: {
  set: Set;
  categories: Category[];
}) {
  const router = useRouter();
  const [titleMl, setTitleMl] = useState(set.title_ml);
  const [titleAr, setTitleAr] = useState(set.title_ar ?? "");
  const [descriptionMl, setDescriptionMl] = useState(set.description_ml ?? "");
  const [categoryId, setCategoryId] = useState(set.category_id);
  const [isPublished, setIsPublished] = useState(set.is_published);
  const [dailyType, setDailyType] = useState(set.daily_type ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await fetch(`/api/admin/sets/${set.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title_ml: titleMl,
        title_ar: titleAr || null,
        description_ml: descriptionMl || null,
        category_id: categoryId,
        is_published: isPublished,
        daily_type: dailyType || null,
      }),
    });

    setSaving(false);
    setSavedAt(Date.now());
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${set.title_ml}" and all its items?`)) return;
    await fetch(`/api/admin/sets/${set.id}`, { method: "DELETE" });
    router.push("/admin/sets");
  }

  return (
    <form
      onSubmit={handleSave}
      className="space-y-4 rounded border border-shell-muted/20 p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className={labelClass}>Title (Malayalam)</label>
          <input
            value={titleMl}
            onChange={(e) => setTitleMl(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Title (Arabic)</label>
          <input
            dir="rtl"
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
            className={`${inputClass} font-amiri text-base`}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Description (Malayalam)</label>
        <textarea
          value={descriptionMl}
          onChange={(e) => setDescriptionMl(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className={labelClass}>Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="text-ink">
                {c.name_ml}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-shell-muted">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="accent-gold"
          />
          Published
        </label>

        <div className="space-y-1">
          <label className={labelClass}>Daily tile</label>
          <select
            value={dailyType}
            onChange={(e) => setDailyType(e.target.value)}
            className={inputClass}
          >
            <option value="" className="text-ink">
              Not a daily tile
            </option>
            <option value="morning" className="text-ink">
              Morning
            </option>
            <option value="evening" className="text-ink">
              Evening
            </option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded border border-gold px-3 py-1.5 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-shell disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        {savedAt && !saving && (
          <span className="text-xs text-shell-muted">Saved</span>
        )}

        <button
          type="button"
          onClick={handleDelete}
          className="ml-auto text-sm text-red-400"
        >
          Delete set
        </button>
      </div>
    </form>
  );
}
