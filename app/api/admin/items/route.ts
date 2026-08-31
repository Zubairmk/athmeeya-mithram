import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(request: NextRequest) {
  const { supabase, unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const { set_id, sort_order } = body;

  if (!set_id) {
    return NextResponse.json({ error: "set_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("dhikr_items")
    .insert({ set_id, arabic_text: "", sort_order: sort_order ?? 0 })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
