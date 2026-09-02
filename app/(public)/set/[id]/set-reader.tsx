"use client";

import { useState } from "react";
import DhikrCard from "@/components/DhikrCard";
import AudioPlayer from "@/components/AudioPlayer";

type Item = {
  id: string;
  source_pdf_url: string | null;
  malayalam_note: string | null;
  audio_url: string | null;
};

export default function SetReader({
  items,
  setTitle,
}: {
  items: Item[];
  setTitle: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIndex = items.findIndex((i) => i.id === activeId);
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;

  function playNext() {
    const next = items.slice(activeIndex + 1).find((i) => i.audio_url);
    setActiveId(next ? next.id : null);
  }

  return (
    <>
      <div className="pb-24">
        {items.map((item, index) => (
          <DhikrCard
            key={item.id}
            index={index}
            sourcePdfUrl={item.source_pdf_url}
            malayalamNote={item.malayalam_note}
            hasAudio={!!item.audio_url}
            isActive={item.id === activeId}
            onPlay={() => setActiveId(item.id)}
          />
        ))}
      </div>

      {activeItem?.audio_url && (
        <AudioPlayer
          title={setTitle}
          src={activeItem.audio_url}
          onEnded={playNext}
        />
      )}
    </>
  );
}
