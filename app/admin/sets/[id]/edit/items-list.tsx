"use client";

import { useState } from "react";
import ItemEditor from "./item-editor";

export type DhikrItem = {
  id: string;
  set_id: string;
  sort_order: number;
  arabic_text: string;
  malayalam_note: string | null;
  audio_url: string | null;
  source_pdf_url: string | null;
};

export default function ItemsList({
  setId,
  initialItems,
}: {
  setId: string;
  initialItems: DhikrItem[];
}) {
  const [items, setItems] = useState<DhikrItem[]>(initialItems);
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    setAdding(true);
    const nextSortOrder =
      items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) + 1 : 0;

    const res = await fetch("/api/admin/items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ set_id: setId, sort_order: nextSortOrder }),
    });

    setAdding(false);

    if (res.ok) {
      const created = await res.json();
      setItems((prev) => [...prev, created]);
    }
  }

  function handleDeleted(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <ItemEditor
          key={item.id}
          item={item}
          index={idx}
          onDeleted={() => handleDeleted(item.id)}
        />
      ))}

      {items.length === 0 && (
        <p className="text-sm text-white/50">No items yet.</p>
      )}

      <button
        onClick={handleAdd}
        disabled={adding}
        className="rounded border border-white/15 px-3 py-1.5 text-sm font-medium text-white/70 disabled:opacity-50"
      >
        {adding ? "Adding..." : "+ Add item"}
      </button>
    </div>
  );
}
