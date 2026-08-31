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
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <p className="text-sm text-gray-500">Signed in as {user.email}</p>
      <Link
        href="/admin/sets"
        className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        Manage Dhikr Sets
      </Link>
      <SignOutButton />
    </main>
  );
}
