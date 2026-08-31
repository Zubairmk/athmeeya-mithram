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
      className={`rounded px-2 py-1 text-xs font-medium ${
        isPublished
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-600"
      } disabled:opacity-50`}
    >
      {isPublished ? "Published" : "Draft"}
    </button>
  );
}
