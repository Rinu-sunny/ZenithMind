import { getSupabaseServer } from "../../../lib/supabaseServerClient";
import { corsHeaders, handleCORS } from "@/lib/cors";
import OpenAI from "openai";

export async function OPTIONS(req) {
  return handleCORS(req);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: corsHeaders() });
    }

    const supabaseServer = getSupabaseServer();
    if (!supabaseServer) {
      return new Response(JSON.stringify({ insight: null, notice: "Supabase not configured" }), { status: 200, headers: corsHeaders() });
    }

    // Fetch recent entries (last 7 days)
    const since = new Date();
    since.setDate(since.getDate() - 7);
    
    const { data: entries, error } = await supabaseServer
      .from("journal_entries")
      .select("content, emotion, sentiment, date")
      .eq("user_id", user_id)
      .gte("date", since.toISOString())
      .order("date", { ascending: false })
      .limit(10);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders() });
    }

    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({ insight: "Start journaling to get personalized insights!" }), { status: 200, headers: corsHeaders() });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    
    // Build context from entries
    const entriesText = entries
      .map((e) => `[${e.emotion || 'Unknown'}] (${Number(e.sentiment || 0.5).toFixed(2)}) - ${e.content}`)
      .join("\n\n");

    // Heuristic fallback generator
    const buildHeuristicInsight = (entriesList) => {
      const emotions = entriesList.map(e => e.emotion).filter(Boolean);
      const avgSentiment = entriesList.reduce((sum, e) => sum + (e.sentiment || 0.5), 0) / entriesList.length;
      const counts = emotions.reduce((acc, emo) => { acc[emo] = (acc[emo] || 0) + 1; return acc; }, {});
      const dominantEmotion = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || "Unknown";

      // Simple trend check: compare average of first half vs second half
      const mid = Math.floor(entriesList.length / 2);
      const firstAvg = entriesList.slice(0, mid).reduce((s, e) => s + (e.sentiment || 0.5), 0) / Math.max(mid, 1);
      const secondAvg = entriesList.slice(mid).reduce((s, e) => s + (e.sentiment || 0.5), 0) / Math.max(entriesList.length - mid, 1);
      const trendWord = secondAvg > firstAvg + 0.05 ? "slightly improving" : (secondAvg < firstAvg - 0.05 ? "a bit down" : "steady");

      const suggestion = dominantEmotion && ["Stressed","Anxious","Sad"].includes(dominantEmotion)
        ? "Try a 10-minute walk or box breathing to reset."
        : "Keep noting positive moments; a short gratitude note helps.";

      return `Your dominant emotion appears to be ${dominantEmotion.toLowerCase()} with an average mood score of ${avgSentiment.toFixed(2)}. Overall your mood looks ${trendWord} this week. ${suggestion}`;
    };

    if (!openaiKey) {
      const mockInsight = buildHeuristicInsight(entries);
      return new Response(JSON.stringify({ insight: mockInsight, notice: "AI disabled — using heuristic insight." }), { status: 200, headers: corsHeaders() });
    }

    // Use OpenAI to generate personalized insight
    const openai = new OpenAI({ apiKey: openaiKey });
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are a compassionate mental health coach. Based on the user's recent journal entries, provide a brief (2-3 sentences), warm, and actionable insight or observation. Be specific to their entries. Do not be generic."
        }, {
          role: "user",
          content: `Here are my recent journal entries with emotions and sentiment scores:\n\n${entriesText}\n\nPlease provide a personalized insight about my mood patterns and suggest one small action I could take to support my wellbeing.`
        }],
        temperature: 0.7,
        max_tokens: 150
      });

      const insight = completion.choices[0].message.content || "Keep exploring your emotions through journaling.";
      return new Response(JSON.stringify({ insight }), { status: 200, headers: corsHeaders() });
    } catch (err) {
      console.error("OpenAI error:", err);
      // Fallback to heuristic insight instead of 500
      const mockInsight = buildHeuristicInsight(entries);
      const notice = err?.code === 'insufficient_quota' ? 'AI quota exceeded — using heuristic insight.' : 'AI unavailable — using heuristic insight.';
      return new Response(JSON.stringify({ insight: mockInsight, notice }), { status: 200, headers: corsHeaders() });
    }
  } catch (err) {
    console.error("Generate insights error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders() });
  }
}
