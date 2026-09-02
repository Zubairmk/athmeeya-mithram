export default function DhikrCard({
  sourcePdfUrl,
  malayalamNote,
  hasAudio,
  isActive,
  onPlay,
}: {
  sourcePdfUrl: string | null;
  malayalamNote: string | null;
  hasAudio: boolean;
  isActive: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="mb-5 rounded-xl border border-line bg-surface p-4 last:mb-0">
      {hasAudio && (
        <button
          onClick={onPlay}
          className={`mb-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
            isActive
              ? "border-green-line bg-green-soft text-green-deep"
              : "border-line text-ink-muted"
          }`}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
            <polygon points="0,0 10,5 0,10" />
          </svg>
          {isActive ? "കേട്ടുകൊണ്ടിരിക്കുന്നു" : "കേൾക്കുക"}
        </button>
      )}

      {sourcePdfUrl ? (
        <div className="relative overflow-hidden rounded-lg border border-line">
          <div className="pointer-events-none absolute inset-1.5 rounded-md border border-gold/40" />
          <iframe
            src={sourcePdfUrl}
            title="Dhikr page"
            className="h-[75vh] w-full"
          />
          <a
            href={sourcePdfUrl}
            target="_blank"
            rel="noreferrer"
            className="block border-t border-line bg-surface px-3 py-2 text-center text-xs text-ink-muted hover:text-green"
          >
            പുതിയ ടാബിൽ തുറക്കുക
          </a>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">ഉള്ളടക്കം ചേർത്തിട്ടില്ല.</p>
      )}

      {malayalamNote && (
        <p className="mt-3 font-malayalam text-sm leading-relaxed text-ink-muted">
          {malayalamNote}
        </p>
      )}
    </div>
  );
}
