import { db } from "@/lib/pg";

const UUID = /^[0-9a-f-]{36}$/i;

export async function GET(_req: Request, ctx: RouteContext<"/api/photos/[id]">) {
  const { id } = await ctx.params;
  const sql = await db();
  if (!sql || !UUID.test(id)) return new Response("Not found", { status: 404 });
  const [p] = await sql<{ mime: string; data: Buffer }[]>`select mime, data from photos where id = ${id}`;
  if (!p) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(p.data), {
    headers: { "Content-Type": p.mime, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
