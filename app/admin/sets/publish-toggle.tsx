"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishToggle({
  setId,
  isPublished,
}: {
  setId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    await fetch(`/api/admin/sets/${setId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ is_published: !isPublished }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
        isPublished
          ? "border-gold text-gold"
          : "border-shell-muted/25 text-shell-muted"
      } disabled:opacity-50`}
    >
      {isPublished ? "Published" : "Draft"}
    </button>
  );
}
