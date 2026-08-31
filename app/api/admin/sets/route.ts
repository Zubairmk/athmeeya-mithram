import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const { supabase, unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabase
    .from("dhikr_sets")
    .select("*, categories(id, name_ml, slug, sort_order)")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { supabase, unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const { category_id, title_ml } = body;

  if (!category_id || !title_ml) {
    return NextResponse.json(
      { error: "category_id and title_ml are required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("dhikr_sets")
    .insert({ category_id, title_ml })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
