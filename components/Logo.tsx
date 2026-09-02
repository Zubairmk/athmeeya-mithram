export default function Logo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M50 6 L61 39 L96 39 L67 59 L78 92 L50 71 L22 92 L33 59 L4 39 L39 39 Z" />
      <circle cx="50" cy="50" r="10" />
    </svg>
  );
}
