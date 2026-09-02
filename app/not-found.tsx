import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center font-sans">
      <p className="text-4xl text-gold">؟</p>
      <h1 className="mt-4 text-lg font-semibold text-ink">
        Page not found
      </h1>
      <Link
        href="/"
        className="mt-8 rounded-full border border-green bg-green px-5 py-2 text-sm font-bold text-white"
      >
        Go home
      </Link>
    </div>
  );
}
