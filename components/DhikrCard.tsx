export default function DhikrCard({
  index,
  sourcePdfUrl,
  malayalamNote,
  hasAudio,
  isActive,
  onPlay,
}: {
  index: number;
  sourcePdfUrl: string | null;
  malayalamNote: string | null;
  hasAudio: boolean;
  isActive: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="mb-6 rounded border border-ink/15 bg-ink/[0.02] p-5 last:mb-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          ഇനം {index + 1}
        </span>

        {hasAudio && (
          <button
            onClick={onPlay}
            className={`flex items-center gap-2 text-xs font-medium ${
              isActive ? "text-gold-ink" : "text-ink-muted"
            }`}
          >
            <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
              <polygon points="0,0 10,5 0,10" />
            </svg>
            {isActive ? "കേട്ടുകൊണ്ടിരിക്കുന്നു" : "കേൾക്കുക"}
          </button>
        )}
      </div>

      {sourcePdfUrl ? (
        <div className="overflow-hidden rounded border border-ink/15">
          <iframe
            src={sourcePdfUrl}
            title="Dhikr page"
            className="h-[75vh] w-full"
          />
          <a
            href={sourcePdfUrl}
            target="_blank"
            rel="noreferrer"
            className="block border-t border-ink/15 px-3 py-2 text-center text-xs text-ink-muted hover:text-ink"
          >
            പുതിയ ടാബിൽ തുറക്കുക
          </a>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">ഉള്ളടക്കം ചേർത്തിട്ടില്ല.</p>
      )}

      {malayalamNote && (
        <p className="mt-4 font-malayalam text-sm leading-relaxed text-ink-muted">
          {malayalamNote}
        </p>
      )}
    </div>
  );
}
