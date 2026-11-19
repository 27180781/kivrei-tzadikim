import { db } from "@/lib/pg";
import { newToken, sendConfirmation, sendManageLink, type Subscriber } from "@/lib/notify";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; daily?: boolean; seudot?: boolean };
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!EMAIL.test(email) || email.length > 200) return Response.json({ error: "כתובת המייל לא תקינה" }, { status: 400 });
  const daily = body.daily !== false;
  const seudot = Boolean(body.seudot);
  if (!daily && !seudot) return Response.json({ error: "בחרו לפחות סוג התראה אחד" }, { status: 400 });
  const sql = await db();
  if (!sql) return Response.json({ error: "השירות עדיין לא פעיל" }, { status: 503 });

  const [existing] = await sql<Subscriber[]>`select * from email_subscribers where email = ${email}`;
  // הגבלה: לא יותר ממייל אחד בשתי דקות לאותה כתובת
  if (existing?.last_mail_at && Date.now() - existing.last_mail_at.getTime() < 120_000) {
    return Response.json({ ok: true });
  }
  let sub: Subscriber;
  if (!existing) {
    [sub] = await sql<Subscriber[]>`insert into email_subscribers (email, token, daily, seudot) values (${email}, ${newToken()}, ${daily}, ${seudot}) returning *`;
  } else if (!existing.confirmed) {
    [sub] = await sql<Subscriber[]>`update email_subscribers set daily = ${daily}, seudot = ${seudot} where id = ${existing.id} returning *`;
  } else {
    sub = existing;
  }
  try {
    if (sub.confirmed) await sendManageLink(sub);
    else await sendConfirmation(sub);
    await sql`update email_subscribers set last_mail_at = now() where id = ${sub.id}`;
  } catch (e) {
    console.error("[subscribe] mail failed", e);
    return Response.json({ error: "לא הצלחנו לשלוח מייל כרגע. נסו שוב מאוחר יותר." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
