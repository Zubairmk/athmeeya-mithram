import Link from "next/link";
import Logo from "./Logo";

export default function Header({
  back,
}: {
  back?: { href: string; label: string };
}) {
  return (
    <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-3">
      {back ? (
        <Link
          href={back.href}
          className="inline-flex min-w-0 items-center gap-2 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <span className="text-green">&larr;</span>
          <span className="truncate font-malayalam">{back.label}</span>
        </Link>
      ) : (
        <span />
      )}
      <Link
        href="/"
        aria-label="ആത്മീയമിത്രം"
        className="shrink-0 text-green transition-opacity hover:opacity-70"
      >
        <Logo className="h-5 w-5" />
      </Link>
    </header>
  );
}
