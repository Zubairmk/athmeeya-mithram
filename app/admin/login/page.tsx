"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-shell p-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded border border-shell-muted/20 p-8"
      >
        <div>
          <p className="text-xs uppercase tracking-wide text-gold">
            ആത്മീയമിത്രം
          </p>
          <h1 className="mt-1 text-lg font-semibold text-shell-muted">
            Admin
          </h1>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-xs font-medium text-shell-muted/70"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-shell-muted/25 bg-transparent px-3 py-2 text-sm text-shell-muted outline-none focus:border-gold"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-shell-muted/70"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-shell-muted/25 bg-transparent px-3 py-2 text-sm text-shell-muted outline-none focus:border-gold"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded border border-gold py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-shell disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
