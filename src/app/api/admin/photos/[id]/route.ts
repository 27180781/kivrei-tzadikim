import { db } from "@/lib/pg";
import { isAdmin, unauthorized } from "@/lib/auth";

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/photos/[id]">) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  const sql = await db();
  if (!sql) return Response.json({ error: "מסד הנתונים לא מוגדר" }, { status: 500 });
  await sql`delete from photos where id = ${id}`;
  return Response.json({ ok: true });
}
