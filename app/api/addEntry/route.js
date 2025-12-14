import { supabase } from "@/supabaseClient";

export async function POST(req) {
  try {
    const { user_id, content, emotion, sentiment, prompt } = await req.json();

    const { data, error } = await supabase.from("journal_entries").insert([
      { user_id, content, emotion, sentiment, prompt, date: new Date().toISOString() }
    ]);

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });

    return new Response(JSON.stringify({ message: "Entry added!", data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
