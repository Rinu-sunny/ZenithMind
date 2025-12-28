import { getSupabaseServer } from "../../../lib/supabaseServerClient";
import { corsHeaders, handleCORS } from "@/lib/cors";

export async function OPTIONS(req) {
  return handleCORS(req);
}

function formatDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: corsHeaders() });
    }

    // fetch recent entries (last 30 days) with sentiment data
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const supabaseServer = getSupabaseServer();
    if (!supabaseServer) {
      return new Response(JSON.stringify({ avgSentiment: null, dominantEmotion: null, entriesThisWeek: 0, currentStreak: 0, trend: [], emotionBreakdown: [] }), { status: 200, headers: corsHeaders() });
    }

    // Query entries with sentiment and emotion data
    const { data: entries, error } = await supabaseServer
      .from("journal_entries")
      .select("date, sentiment, emotion")
      .eq("user_id", user_id)
      .gte("date", since.toISOString())
      .order("date", { ascending: true });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders() });
    }

    const data = entries || [];

    // Average sentiment
    const scores = data.map((e) => (e.sentiment != null ? Number(e.sentiment) : null)).filter(Boolean);
    const avgSentiment = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : null;

    // Emotion breakdown & dominant
    const emotionCounts = {};
    for (const e of data) {
      const em = e.emotion || "Unknown";
      emotionCounts[em] = (emotionCounts[em] || 0) + 1;
    }
    const emotionBreakdown = Object.entries(emotionCounts).map(([name, count]) => ({ name, value: count }));
    const dominantEmotion = Object.entries(emotionCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;

    // Weekly trend (last 7 days)
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      const dayEntries = data.filter((e) => formatDateKey(new Date(e.date)) === key);
      const dayScores = dayEntries.map((e)=> (e.sentiment!=null?Number(e.sentiment):null)).filter(Boolean);
      const avg = dayScores.length ? dayScores.reduce((a,b)=>a+b,0)/dayScores.length : null;
      trend.push({ day: d.toLocaleDateString(undefined, { weekday: 'short' }), score: avg ?? 0 });
    }

    // Entries this week (last 7 days)
    const weekSince = new Date();
    weekSince.setDate(weekSince.getDate() - 6);
    const entriesThisWeek = data.filter((e)=> new Date(e.date) >= weekSince).length;

    // Current streak (consecutive days ending today with at least one entry)
    const dateSet = new Set(data.map(e=>formatDateKey(new Date(e.date))));
    let streak = 0;
    for (let i=0;;i++){
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      if (dateSet.has(key)) streak++; else break;
    }

    return new Response(JSON.stringify({ avgSentiment, dominantEmotion, entriesThisWeek, currentStreak: streak, trend, emotionBreakdown }), { status: 200, headers: corsHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders() });
  }
}
