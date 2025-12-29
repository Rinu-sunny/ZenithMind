import { supabase } from "@/supabaseClient";
import { getSupabaseServer } from "../../../lib/supabaseServerClient";
import { corsHeaders, handleCORS } from "@/lib/cors";
import { analyzeJournal } from "@/ai/analyser";

export async function OPTIONS(req) {
  return handleCORS(req);
}

export async function POST(req) {
  try {
    const { user_id, force_reanalyze } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id required' }), { status: 400, headers: corsHeaders() });
    }

    const supabaseServer = getSupabaseServer();
    const client = supabaseServer || supabase;

    // Fetch entries needing analysis
    let query = client
      .from('journal_entries')
      .select('id, content, date')
      .eq('user_id', user_id);
    
    // If not forcing re-analysis, only get entries missing data
    if (!force_reanalyze) {
      query = query.or('emotion.is.null,sentiment.is.null,mood_label.is.null,ai_reflection.is.null');
    }
    
    const { data: entries, error: fetchError } = await query
      .order('date', { ascending: false })
      .limit(100);

    if (fetchError) {
      return new Response(JSON.stringify({ error: fetchError.message }), { status: 500, headers: corsHeaders() });
    }

    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({ notice: 'No entries to analyze' }), { status: 200, headers: corsHeaders() });
    }

    // Local analysis path only (no external API)
    const updates = entries.map(entry => {
      const result = analyzeJournal(entry.content);
      return {
        id: entry.id,
        emotion: result.emotion || 'neutral',
        sentiment: typeof result.sentiment_score === 'number' ? result.sentiment_score : 0.5,
        prompt: result.reflective_prompt || null
      };
    });

    // Update all analyzed entries
    for (const update of updates) {
      const { error: updateError } = await client
        .from('journal_entries')
        .update({ 
          emotion: update.emotion, 
          sentiment: update.sentiment,
          mood_label: update.emotion,
          ai_reflection: update.prompt || null
        })
        .eq('id', update.id);
      
      if (updateError) {
        console.error(`Failed to update entry ${update.id}:`, updateError);
      }
    }

    return new Response(JSON.stringify({ 
      insight: `Analyzed ${updates.length} entries using local AI module`,
      analyzed: updates.length 
    }), { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error('Analyze entries error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders() });
  }
}
