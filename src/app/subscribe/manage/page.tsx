import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/pg";
import PageHeader from "@/components/PageHeader";
import ManageForm from "@/components/ManageForm";

export const metadata: Metadata = { title: "ניהול התראות", robots: { index: false } };

export default async function ManagePage({ searchParams }: PageProps<"/subscribe/manage">) {
  await connection();
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  const sql = await db();
  const [sub] = sql && token ? await sql<{ email: string; daily: boolean; seudot: boolean }[]>`select email, daily, seudot from email_subscribers where token = ${token}` : [];
  return (
    <div>
      <PageHeader title="ניהול התראות" subtitle={sub ? `ההגדרות עבור ${sub.email}` : undefined} />
      <div className="max-w-lg mx-auto">
        {sp.confirmed && sub ? <p className="card p-4 mb-4 text-center">✅ ההרשמה אושרה! מעכשיו תקבלו את ההתראות שבחרתם.</p> : null}
        {sub ? <ManageForm token={token} daily={sub.daily} seudot={sub.seudot} /> : <p className="card p-6 text-muted text-center">הקישור לא תקין, או שההרשמה כבר הוסרה.</p>}
      </div>
    </div>
  );
}
