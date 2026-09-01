export default function DhikrCard({
  arabicText,
  malayalamNote,
  hasAudio,
  isActive,
  onPlay,
}: {
  arabicText: string;
  malayalamNote: string | null;
  hasAudio: boolean;
  isActive: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="border-b border-ink/15 py-8 last:border-none">
      {hasAudio && (
        <button
          onClick={onPlay}
          className={`mb-4 flex items-center gap-2 text-xs font-medium ${
            isActive ? "text-gold" : "text-ink-muted"
          }`}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
            <polygon points="0,0 10,5 0,10" />
          </svg>
          {isActive ? "കേട്ടുകൊണ്ടിരിക്കുന്നു" : "കേൾക്കുക"}
        </button>
      )}

      <p
        dir="rtl"
        className="font-amiri text-3xl leading-loose text-ink sm:text-4xl"
      >
        {arabicText}
      </p>

      {malayalamNote && (
        <p className="mt-4 font-malayalam text-sm leading-relaxed text-ink-muted">
          {malayalamNote}
        </p>
      )}
    </div>
  );
}
