import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./sign-out-button";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-shell p-8 text-center">
      <p className="text-xs uppercase tracking-wide text-gold">
        ആത്മീയമിത്രം
      </p>
      <h1 className="text-lg font-semibold text-shell-muted">Admin</h1>
      <p className="text-sm text-shell-muted/60">Signed in as {user.email}</p>
      <Link
        href="/admin/sets"
        className="mt-4 rounded border border-gold px-5 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-shell"
      >
        Manage Dhikr Sets
      </Link>
      <SignOutButton />
    </main>
  );
}
