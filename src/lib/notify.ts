import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "./pg";
import { fetchTzadikim, fetchUpcomingEvents, hillulotOn } from "./db";
import { currentHebrewDate, formatDateTime, formatGregorian, formatHebrew } from "./hebrew";
import { esc, layout, mailConfigured, sendMail, siteUrl } from "./mail";
import type { HillulaEvent } from "./types";

export type Subscriber = { id: string; email: string; token: string; daily: boolean; seudot: boolean; confirmed: boolean; last_mail_at: Date | null };

export const newToken = () => randomBytes(24).toString("base64url");

const manageUrl = (s: Subscriber) => `${siteUrl()}/subscribe/manage?token=${s.token}`;
const unsubUrl = (s: Subscriber) => `${siteUrl()}/api/unsubscribe?token=${s.token}`;
const footer = (s: Subscriber) => [
  { label: "שינוי העדפות", url: manageUrl(s) },
  { label: "הסרה מרשימת התפוצה", url: unsubUrl(s) },
];

export async function sendConfirmation(s: Subscriber) {
  const url = `${siteUrl()}/api/subscribe/confirm?token=${s.token}`;
  const body = `<p>שלום,</p><p>כדי להתחיל לקבל התראות על הילולות${s.seudot ? " ועל סעודות הילולה" : ""}, אשרו את ההרשמה:</p>
<p style="text-align:center;margin:28px 0"><a href="${url}" style="background:#a57a2c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:bold">אישור ההרשמה</a></p>
<p style="font-size:13px;color:#6f6556">אם לא נרשמתם, אפשר להתעלם מהמייל הזה.</p>`;
  return sendMail({ to: s.email, subject: "אישור הרשמה להתראות קברי צדיקים", html: layout("אישור הרשמה", body), text: `לאישור ההרשמה: ${url}` });
}

export async function sendManageLink(s: Subscriber) {
  const body = `<p>אתם כבר רשומים להתראות. לשינוי ההעדפות או להסרה:</p>
<p style="text-align:center;margin:28px 0"><a href="${manageUrl(s)}" style="background:#a57a2c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:bold">ניהול ההרשמה</a></p>`;
  return sendMail({ to: s.email, subject: "ניהול ההרשמה להתראות", html: layout("ניהול ההרשמה", body, footer(s)), text: `לניהול ההרשמה: ${manageUrl(s)}` });
}

/** המייל היומי: ההילולות שמתחילות הערב בשקיעה, וסעודות ביומיים הקרובים. */
export async function buildDailyDigest() {
  const all = await fetchTzadikim();
  const tonight = currentHebrewDate().next();
  const list = hillulotOn(all, tonight);
  const soon = (await fetchUpcomingEvents({ limit: 20 })).filter(
    (e) => new Date(e.starts_at).getTime() < Date.now() + 48 * 3600 * 1000,
  );
  const byId = new Map(all.map((t) => [t.id, t]));
  const date = `${formatHebrew(tonight, false)} (מתחיל הערב, ${formatGregorian(new Date())})`;

  const items = list.length
    ? list.map((t) => `<li style="margin-bottom:10px"><a href="${siteUrl()}/tzadik/${encodeURIComponent(t.slug)}" style="color:#1c1a17;font-weight:bold">${esc(t.name)}</a>${t.site ? ` · ${esc(t.site.name)}` : ""}${t.bio_short ? `<br><span style="color:#6f6556;font-size:14px">${esc(t.bio_short)}</span>` : ""}</li>`).join("")
    : `<li>אין במאגר הילולות שחלות הערב.</li>`;
  const seudot = soon.length
    ? `<h3 style="color:#a57a2c;margin-top:24px">סעודות הילולה קרובות</h3><ul style="padding-right:18px">${soon.map((e) => seudaLine(e, byId.get(e.tzadik_id ?? "")?.name)).join("")}</ul>`
    : "";
  const html = `<h3 style="color:#a57a2c;margin-top:0">הילולות ${esc(date)}</h3><ul style="padding-right:18px">${items}</ul>${seudot}
<p style="text-align:center;margin-top:24px"><a href="${siteUrl()}/app" style="color:#a57a2c;font-weight:bold">🧭 לניווט לציונים</a></p>`;
  const text = `הילולות ${date}:\n` + (list.length ? list.map((t) => `- ${t.name}${t.site ? `, ${t.site.name}` : ""}`).join("\n") : "אין הילולות הערב.");
  return { subject: list.length ? `הילולות הערב: ${list.map((t) => t.name).join(", ")}` : `הילולות ${formatHebrew(tonight, false)}`, html, text, count: list.length };
}

function seudaLine(e: HillulaEvent, name?: string) {
  const status = e.status === "cancelled" ? ` <b style="color:#b91c1c">(בוטלה)</b>` : e.status === "updated" ? ` <b style="color:#b45309">(עודכנה)</b>` : "";
  return `<li style="margin-bottom:8px">${name ? `סעודת הילולה ל${esc(name)}` : "סעודת הילולה"}, ${esc(formatDateTime(e.starts_at))}${e.location_text ? `, ${esc(e.location_text)}` : ""}${status}</li>`;
}

/** שולח את המייל היומי לכל המנויים המאושרים. */
export async function sendDailyDigest() {
  const sql = await db();
  if (!sql || !mailConfigured()) return 0;
  const digest = await buildDailyDigest();
  const subs = await sql<Subscriber[]>`select * from email_subscribers where confirmed and daily`;
  let sent = 0;
  for (const s of subs) {
    try {
      await sendMail({ to: s.email, subject: digest.subject, html: layout("ההילולות היומיות", digest.html, footer(s)), text: digest.text, idempotencyKey: `daily-${new Date().toISOString().slice(0, 10)}-${s.id}` });
      sent++;
    } catch (e) {
      console.error("[mail] daily failed for", s.email, e);
    }
  }
  return sent;
}

/** התראה על סעודה חדשה או מעודכנת. */
export async function notifySeuda(eventId: string, isNew: boolean) {
  const sql = await db();
  if (!sql || !mailConfigured()) return;
  const [e] = await sql<(Omit<HillulaEvent, "starts_at"> & { starts_at: Date })[]>`select * from hillula_events where id = ${eventId}`;
  if (!e || e.starts_at.getTime() < Date.now()) return;
  const all = await fetchTzadikim();
  const t = all.find((x) => x.id === e.tzadik_id);
  const ev: HillulaEvent = { ...e, starts_at: e.starts_at.toISOString() } as HillulaEvent;
  const what = e.status === "cancelled" ? "בוטלה" : isNew ? "חדשה" : "עודכנה";
  const subject = `סעודת הילולה ${what}${t ? `: ${t.name}` : ""}`;
  const html = `<ul style="padding-right:18px">${seudaLine(ev, t?.name)}</ul>
${e.organizer ? `<p>מארגן: ${esc(e.organizer)}${e.contact_phone ? ` · ${esc(e.contact_phone)}` : ""}</p>` : ""}
${e.details ? `<p style="white-space:pre-line">${esc(e.details)}</p>` : ""}
${t ? `<p><a href="${siteUrl()}/tzadik/${encodeURIComponent(t.slug)}" style="color:#a57a2c;font-weight:bold">לפרטים ודרכי הגעה</a></p>` : ""}`;
  const subs = await sql<Subscriber[]>`select * from email_subscribers where confirmed and seudot`;
  for (const s of subs) {
    try {
      await sendMail({ to: s.email, subject, html: layout(subject, html, footer(s)), text: subject, idempotencyKey: `seuda-${eventId}-${e.updated_at?.valueOf?.() ?? ""}-${s.id}` });
    } catch (err) {
      console.error("[mail] seuda alert failed for", s.email, err);
    }
  }
}
