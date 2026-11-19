import { db } from "@/lib/pg";
import { isAdmin, unauthorized } from "@/lib/auth";

const MAX_BYTES = 8 * 1024 * 1024;

export async function GET(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const tzadikId = new URL(req.url).searchParams.get("tzadik_id");
  const sql = await db();
  if (!sql || !tzadikId) return Response.json([]);
  const rows = await sql`select id, caption, sort from photos where tzadik_id = ${tzadikId} order by sort, created_at`;
  return Response.json(rows);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const sql = await db();
  if (!sql) return Response.json({ error: "מסד הנתונים לא מוגדר" }, { status: 500 });
  const form = await req.formData();
  const tzadikId = String(form.get("tzadik_id") ?? "");
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!tzadikId || !files.length) return Response.json({ error: "חסר קובץ" }, { status: 400 });
  for (const f of files) {
    if (!f.type.startsWith("image/")) return Response.json({ error: `${f.name} אינו קובץ תמונה` }, { status: 400 });
    if (f.size > MAX_BYTES) return Response.json({ error: `${f.name} גדול מ-8MB` }, { status: 400 });
  }
  const [{ max }] = await sql<{ max: number }[]>`select coalesce(max(sort), -1)::int as max from photos where tzadik_id = ${tzadikId}`;
  let sort = max + 1;
  for (const f of files) {
    const data = Buffer.from(await f.arrayBuffer());
    await sql`insert into photos (tzadik_id, mime, data, sort) values (${tzadikId}, ${f.type}, ${data}, ${sort++})`;
  }
  return Response.json({ ok: true });
}
