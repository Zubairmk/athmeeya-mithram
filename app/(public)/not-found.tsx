import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="font-amiri text-4xl text-gold">؟</p>
      <h1 className="mt-4 font-malayalam text-lg font-semibold text-ink">
        ഈ പേജ് കണ്ടെത്താനായില്ല
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        തിരയുന്ന താൾ ഇവിടെയില്ല, നീക്കം ചെയ്തിരിക്കാം.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full border border-green bg-green px-5 py-2 text-sm font-bold text-white"
      >
        ഹോമിലേക്ക് മടങ്ങുക
      </Link>
    </div>
  );
}
