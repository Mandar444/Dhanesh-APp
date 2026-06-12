import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://hlasknkxnosdkvbykybf.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const isConfigured = supabaseAnonKey && supabaseAnonKey !== "your_supabase_anon_key_here" && supabaseAnonKey.trim() !== "";

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
export const isSupabaseLive = isConfigured;
