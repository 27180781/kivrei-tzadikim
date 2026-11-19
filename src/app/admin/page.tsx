import type { Metadata } from "next";
import { connection } from "next/server";
import AdminApp from "@/components/admin/AdminApp";
import { adminConfigured, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "ניהול", robots: { index: false } };

export default async function AdminPage() {
  await connection();
  if (!adminConfigured()) {
    return <p className="card p-4">כדי להפעיל את ממשק הניהול צריך להגדיר את משתנה הסביבה ADMIN_PASSWORD באפליקציה ב-CapRover.</p>;
  }
  if (!process.env["DATABASE_URL"]) {
    return <p className="card p-4">מסד הנתונים לא מחובר. צריך להגדיר את DATABASE_URL באפליקציה ב-CapRover.</p>;
  }
  return <AdminApp loggedIn={await isAdmin()} />;
}
