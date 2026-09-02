import Link from "next/link";
import Logo from "./Logo";

export default function BrandLink({
  href,
  label,
  tone = "shell",
}: {
  href: string;
  label: string;
  tone?: "shell" | "ink";
}) {
  const color =
    tone === "ink"
      ? "text-ink-muted hover:text-ink"
      : "text-shell-muted hover:text-manuscript";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 text-sm transition-colors ${color}`}
    >
      <Logo className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}
