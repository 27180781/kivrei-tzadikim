import { db } from "@/lib/pg";
import { isAdmin, unauthorized } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  const sql = await db();
  if (!sql) return Response.json({ subscribers: null, calls24h: null });
  const [s] = await sql<{ n: number }[]>`select count(*)::int as n from ivr_subscribers where active`;
  const [c] = await sql<{ n: number }[]>`select count(*)::int as n from ivr_call_log where created_at > now() - interval '24 hours' and step = 'start'`;
  return Response.json({ subscribers: s.n, calls24h: c.n });
}
