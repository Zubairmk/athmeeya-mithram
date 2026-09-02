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
    <div className="mb-6 rounded border border-gold/40 bg-shell p-5 last:mb-0">
      {hasAudio && (
        <button
          onClick={onPlay}
          className={`mb-4 flex items-center gap-2 text-xs font-medium ${
            isActive ? "text-gold" : "text-shell-muted"
          }`}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
            <polygon points="0,0 10,5 0,10" />
          </svg>
          {isActive ? "കേട്ടുകൊണ്ടിരിക്കുന്നു" : "കേൾക്കുക"}
        </button>
      )}

      {sourcePdfUrl ? (
        <div className="overflow-hidden rounded border border-gold/20">
          <iframe
            src={sourcePdfUrl}
            title="Dhikr page"
            className="h-[75vh] w-full"
          />
          <a
            href={sourcePdfUrl}
            target="_blank"
            rel="noreferrer"
            className="block border-t border-gold/20 bg-shell px-3 py-2 text-center text-xs text-shell-muted hover:text-manuscript"
          >
            പുതിയ ടാബിൽ തുറക്കുക
          </a>
        </div>
      ) : (
        <p className="text-sm text-shell-muted">ഉള്ളടക്കം ചേർത്തിട്ടില്ല.</p>
      )}

      {malayalamNote && (
        <p className="mt-4 font-malayalam text-sm leading-relaxed text-shell-muted">
          {malayalamNote}
        </p>
      )}
    </div>
  );
}
