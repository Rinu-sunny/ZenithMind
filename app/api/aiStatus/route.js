import { corsHeaders, handleCORS } from "@/lib/cors";

export async function OPTIONS(req) {
  return handleCORS(req);
}

export async function GET() {
  try {
    const openai = !!process.env.OPENAI_API_KEY;
    const supabaseAvailable = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    return new Response(JSON.stringify({ available: openai, supabaseAvailable }), { status: 200, headers: corsHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ available: false }), { status: 200, headers: corsHeaders() });
  }
}
