import { db } from "@/lib/pg";
import { isAdmin, unauthorized } from "@/lib/auth";
import { cleanRow, dbError, entityFor } from "@/lib/admin-tables";

export async function PUT(req: Request, ctx: RouteContext<"/api/admin/[table]/[id]">) {
  if (!(await isAdmin())) return unauthorized();
  const { table, id } = await ctx.params;
  const entity = entityFor(table);
  const sql = await db();
  if (!entity || !sql) return Response.json({ error: "לא נמצא" }, { status: 404 });
  const row = cleanRow(entity, await req.json());
  if (!Object.keys(row).length) return Response.json({ error: "אין שינויים" }, { status: 400 });
  try {
    const [updated] = await sql`update ${sql(entity.table)} set ${sql(row)} where id = ${id} returning *`;
    return updated ? Response.json(updated) : Response.json({ error: "לא נמצא" }, { status: 404 });
  } catch (e) {
    return dbError(e);
  }
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/[table]/[id]">) {
  if (!(await isAdmin())) return unauthorized();
  const { table, id } = await ctx.params;
  const entity = entityFor(table);
  const sql = await db();
  if (!entity || !sql) return Response.json({ error: "לא נמצא" }, { status: 404 });
  try {
    await sql`delete from ${sql(entity.table)} where id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    return dbError(e);
  }
}
