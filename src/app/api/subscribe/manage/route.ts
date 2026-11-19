import { db } from "@/lib/pg";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { token?: string; daily?: boolean; seudot?: boolean; unsubscribe?: boolean };
  const sql = await db();
  if (!sql || !b.token) return Response.json({ error: "קישור לא תקין" }, { status: 400 });
  if (b.unsubscribe || (!b.daily && !b.seudot)) {
    const r = await sql`delete from email_subscribers where token = ${b.token} returning id`;
    return r.length ? Response.json({ ok: true, removed: true }) : Response.json({ error: "קישור לא תקין" }, { status: 404 });
  }
  const r = await sql`update email_subscribers set daily = ${Boolean(b.daily)}, seudot = ${Boolean(b.seudot)}, confirmed = true,
                      confirmed_at = coalesce(confirmed_at, now()) where token = ${b.token} returning id`;
  return r.length ? Response.json({ ok: true }) : Response.json({ error: "קישור לא תקין" }, { status: 404 });
}
