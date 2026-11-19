import { db } from "@/lib/pg";
import { siteUrl } from "@/lib/mail";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const sql = await db();
  if (sql && token) {
    const rows = await sql`update email_subscribers set confirmed = true, confirmed_at = coalesce(confirmed_at, now())
                           where token = ${token} returning id`;
    if (rows.length) return Response.redirect(`${siteUrl()}/subscribe/manage?token=${encodeURIComponent(token)}&confirmed=1`, 303);
  }
  return Response.redirect(`${siteUrl()}/subscribe?invalid=1`, 303);
}
