"use client";
import { createBrowserClient } from "@supabase/ssr";

export function browserClient(config: { url: string; anonKey: string } | null) {
  if (!config) return null;
  return createBrowserClient(config.url, config.anonKey);
}
