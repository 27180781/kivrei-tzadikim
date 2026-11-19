import { db } from "@/lib/pg";
import { siteUrl } from "@/lib/mail";

async function remove(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const sql = await db();
  if (sql && token) await sql`delete from email_subscribers where token = ${token}`;
  return Response.redirect(`${siteUrl()}/subscribe?removed=1`, 303);
}

export const GET = remove;
export const POST = remove;
