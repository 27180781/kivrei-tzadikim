import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * משתני הסביבה נקראים בזמן ריצה (גישה דינמית, כדי ש-Next לא יקבע אותם בזמן הבנייה).
 * כך אותו Docker image עובד בכל שרת, והגדרות CapRover נכנסות לתוקף ב-restart.
 */
const env = (name: string): string | undefined => process.env[name] || undefined;

export function supabaseConfig(): { url: string; anonKey: string } | null {
  const url = env("SUPABASE_URL") ?? env("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = env("SUPABASE_ANON_KEY") ?? env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return url && anonKey ? { url, anonKey } : null;
}

/** לקוח לקריאה ציבורית (צד שרת). */
export function publicClient(): SupabaseClient | null {
  const c = supabaseConfig();
  if (!c) return null;
  return createClient(c.url, c.anonKey, { auth: { persistSession: false } });
}

/** לקוח עם service role, לשימוש בשרת בלבד (רישום מנויים ויומן שיחות של השלוחה). */
export function serviceClient(): SupabaseClient | null {
  const c = supabaseConfig();
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!c || !key) return null;
  return createClient(c.url, key, { auth: { persistSession: false } });
}
