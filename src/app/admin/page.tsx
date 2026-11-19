import type { Metadata } from "next";
import { connection } from "next/server";
import AdminApp from "@/components/admin/AdminApp";
import { supabaseConfig } from "@/lib/supabase";

export const metadata: Metadata = { title: "ניהול", robots: { index: false } };

export default async function AdminPage() {
  await connection();
  // כתובת ומפתח anon הם ציבוריים מטבעם (מוגנים ב-RLS), ולכן מועברים לדפדפן
  return <AdminApp config={supabaseConfig()} />;
}
