import { supabase } from "@/supabaseClient";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user_id)
      .order("date", { ascending: false });

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });

    return new Response(JSON.stringify({ entries: data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
