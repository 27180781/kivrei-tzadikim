import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";

export const metadata: Metadata = { title: "ניהול", robots: { index: false } };

export default function AdminPage() {
  return <AdminApp />;
}
