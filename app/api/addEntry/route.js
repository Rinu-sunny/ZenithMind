import { supabase } from "@/supabaseClient";
import { getSupabaseServer } from "@/lib/supabaseServerClient";
import { corsHeaders, handleCORS } from "@/lib/cors";

export async function OPTIONS(req) {
  return handleCORS(req);
}

export async function POST(req) {
  try {
    const { user_id, content, emotion, sentiment, prompt } = await req.json();

    const supabaseServer = getSupabaseServer();
    const client = supabaseServer || supabase;

    const { data, error } = await client.from("journal_entries").insert([
      { user_id, content, emotion, sentiment, prompt, date: new Date().toISOString() }
    ]);

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders() });

    return new Response(JSON.stringify({ message: "Entry added!", data }), { status: 200, headers: corsHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders() });
  }
}
