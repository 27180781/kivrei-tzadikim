import { after } from "next/server";
import { db } from "@/lib/pg";
import { notifySeuda } from "@/lib/notify";
import { isAdmin, unauthorized } from "@/lib/auth";
import { cleanRow, dbError, entityFor } from "@/lib/admin-tables";

export async function GET(_req: Request, ctx: RouteContext<"/api/admin/[table]">) {
  if (!(await isAdmin())) return unauthorized();
  const { table } = await ctx.params;
  const entity = entityFor(table);
  const sql = await db();
  if (!entity || !sql) return Response.json({ error: !sql ? "מסד הנתונים לא מוגדר (DATABASE_URL)" : "לא נמצא" }, { status: 404 });
  const dir = entity.table === "hillula_events" ? sql`desc` : sql`asc`;
  const rows = await sql`select * from ${sql(entity.table)} order by ${sql(entity.order)} ${dir}`;
  return Response.json(rows);
}

export async function POST(req: Request, ctx: RouteContext<"/api/admin/[table]">) {
  if (!(await isAdmin())) return unauthorized();
  const { table } = await ctx.params;
  const entity = entityFor(table);
  const sql = await db();
  if (!entity || !sql) return Response.json({ error: "לא נמצא" }, { status: 404 });
  const row = cleanRow(entity, await req.json());
  try {
    const [created] = await sql`insert into ${sql(entity.table)} ${sql(row)} returning *`;
    if (entity.table === "hillula_events") after(() => notifySeuda(created.id, true).catch((e) => console.error("[notify]", e)));
    return Response.json(created);
  } catch (e) {
    return dbError(e);
  }
}
