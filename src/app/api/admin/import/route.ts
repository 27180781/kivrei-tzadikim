import { db } from "@/lib/pg";
import { isAdmin, unauthorized } from "@/lib/auth";
import { importHillulot } from "@/lib/csv-import";

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const sql = await db();
  if (!sql) return Response.json({ error: "מסד הנתונים לא מחובר" }, { status: 503 });
  const text = await req.text();
  if (!text.trim()) return Response.json({ error: "הקובץ ריק" }, { status: 400 });
  try {
    return Response.json(await importHillulot(sql, text));
  } catch (e) {
    return Response.json({ error: `הייבוא נכשל: ${(e as Error).message}` }, { status: 400 });
  }
}
