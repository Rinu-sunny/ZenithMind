import { supabase } from "@/supabaseClient";
import { getSupabaseServer } from "../../../lib/supabaseServerClient";
import { corsHeaders, handleCORS } from "@/lib/cors";
import OpenAI from "openai";

export async function OPTIONS(req) {
  return handleCORS(req);
}

export async function POST(req) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id required' }), { status: 400, headers: corsHeaders() });
    }

    const supabaseServer = getSupabaseServer();
    const client = supabaseServer || supabase;

    // Fetch entries that haven't been analyzed yet
    const { data: entries, error: fetchError } = await client
      .from('journal_entries')
      .select('id, content, date')
      .eq('user_id', user_id)
      .is('emotion', null)
      .order('date', { ascending: false })
      .limit(20);

    if (fetchError) {
      return new Response(JSON.stringify({ error: fetchError.message }), { status: 500, headers: corsHeaders() });
    }

    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({ notice: 'No new entries to analyze' }), { status: 200, headers: corsHeaders() });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    
    // Function to do keyword-based analysis
    const analyzeWithKeywords = (content) => {
      const lower = content.toLowerCase();
      const positives = ['good', 'great', 'happy', 'relieved', 'better', 'calm', 'excited', 'hopeful'];
      const negatives = ['sad', 'anxious', 'angry', 'stressed', 'worried', 'depressed', 'overwhelmed'];
      
      let score = 0.5;
      let emotion = 'Calm';
      
      for (const p of positives) {
        if (lower.includes(p)) {
          score += 0.15;
          emotion = p.charAt(0).toUpperCase() + p.slice(1);
        }
      }
      for (const n of negatives) {
        if (lower.includes(n)) {
          score -= 0.15;
          emotion = n.charAt(0).toUpperCase() + n.slice(1);
        }
      }
      
      score = Math.max(0, Math.min(1, Number(score.toFixed(2))));
      return { emotion, sentiment: score };
    };
    
    if (!openaiKey) {
      // Mock analysis fallback
      const updates = entries.map(entry => {
        const result = analyzeWithKeywords(entry.content);
        return { id: entry.id, emotion: result.emotion, sentiment: result.sentiment };
      });

      // Update all entries
      for (const update of updates) {
        const { error: updateError } = await client
          .from('journal_entries')
          .update({ 
            emotion: update.emotion, 
            sentiment: update.sentiment,
            mood_label: update.emotion
          })
          .eq('id', update.id);
        
        if (updateError) {
          console.error(`Failed to update entry ${update.id}:`, updateError);
        }
      }

      return new Response(JSON.stringify({ 
        insight: `Analyzed ${updates.length} entries using keyword detection`,
        analyzed: updates.length 
      }), { status: 200, headers: corsHeaders() });
    }

    // Use OpenAI to analyze each entry
    const openai = new OpenAI({ apiKey: openaiKey });
    const updates = [];

    for (const entry of entries) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{
            role: "system",
            content: "You are a mental health assistant. Analyze the journal entry and respond with ONLY a JSON object containing: emotion (one word: Happy, Sad, Anxious, Calm, Stressed, Hopeful, or Angry) and sentiment (a number between 0 and 1, where 0 is very negative and 1 is very positive)."
          }, {
            role: "user",
            content: entry.content
          }],
          temperature: 0.3,
          max_tokens: 50
        });

        const responseText = completion.choices[0].message.content;
        const parsed = JSON.parse(responseText);
        
        updates.push({
          id: entry.id,
          emotion: parsed.emotion || 'Calm',
          sentiment: typeof parsed.sentiment === 'number' ? parsed.sentiment : 0.5
        });
      } catch (err) {
        console.error(`OpenAI failed for entry ${entry.id}, using keyword fallback:`, err.message);
        // Fall back to keyword analysis
        const result = analyzeWithKeywords(entry.content);
        updates.push({
          id: entry.id,
          emotion: result.emotion,
          sentiment: result.sentiment
        });
      }
    }

    // Update all analyzed entries
    for (const update of updates) {
      const { error: updateError } = await client
        .from('journal_entries')
        .update({ 
          emotion: update.emotion, 
          sentiment: update.sentiment,
          mood_label: update.emotion
        })
        .eq('id', update.id);
      
      if (updateError) {
        console.error(`Failed to update entry ${update.id}:`, updateError);
      }
    }

    return new Response(JSON.stringify({ 
      insight: `Successfully analyzed ${updates.length} entries`,
      analyzed: updates.length 
    }), { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error('Analyze entries error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders() });
  }
}
