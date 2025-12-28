import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
	throw new Error('SUPABASE URL is required. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL in your environment.');
}

if (!supabaseAnonKey) {
	console.warn('Warning: SUPABASE anon key is not set (NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY). Some client operations may fail.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
