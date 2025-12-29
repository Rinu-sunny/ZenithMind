import { getSupabaseServer } from "../../../lib/supabaseServerClient";
import { corsHeaders, handleCORS } from "@/lib/cors";

export async function OPTIONS(req) {
  return handleCORS(req);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const email = (body?.email || "").trim();

    if (!email) {
      return new Response(JSON.stringify({ error: "email required" }), { status: 400, headers: corsHeaders() });
    }

    const supabaseServer = getSupabaseServer();
    if (!supabaseServer) {
      return new Response(JSON.stringify({ error: "server client unavailable" }), { status: 500, headers: corsHeaders() });
    }

    // Use Supabase Admin API with service role to check if a user exists
    const { data, error } = await supabaseServer.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      // Some versions support email filter; we include explicit filter when available
      email,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders() });
    }

    const users = data?.users || [];
    const exists = users.some((u) => (u.email || "").toLowerCase() === email.toLowerCase());

    return new Response(JSON.stringify({ exists }), { status: 200, headers: corsHeaders() });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders() });
  }
}
