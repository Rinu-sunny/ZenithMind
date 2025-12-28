import { supabase } from "@/supabaseClient";
import { getSupabaseServer } from "@/lib/supabaseServerClient";
import { corsHeaders, handleCORS } from "@/lib/cors";

export async function OPTIONS(req) {
  return handleCORS(req);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    const supabaseServer = getSupabaseServer();
    const client = supabaseServer || supabase;

    const { data, error } = await client
      .from("journal_entries")
      .select("*")
      .eq("user_id", user_id)
      .order("date", { ascending: false });

    if (error) {
      // common local dev issue: table missing in Supabase
      if (String(error.message || "").includes("Could not find the table 'public.journal_entries'")) {
        return new Response(JSON.stringify({ error: 'Missing table public.journal_entries. Run migrations/migrations/002_create_journal_entries.sql in your Supabase SQL editor.' }), { status: 500, headers: corsHeaders() });
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders() });
    }

    return new Response(JSON.stringify({ entries: data }), { status: 200, headers: corsHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders() });
  }
}
