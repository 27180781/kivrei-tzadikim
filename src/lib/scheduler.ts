import { db } from "./pg";
import { IL_TZ } from "./hebrew";
import { sendDailyDigest } from "./notify";

/** שעת שליחת המייל היומי בשעון ישראל (ברירת מחדל 12:00). */
const DAILY_HOUR = Number(process.env["EMAIL_DAILY_HOUR"] ?? 12);

function israelNow() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: IL_TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) };
}

async function tick() {
  const { date, hour } = israelNow();
  if (hour < DAILY_HOUR) return;
  const sql = await db();
  if (!sql) return;
  // רק מופע אחד שולח, ורק פעם אחת ביום
  const claimed = await sql`insert into job_runs (job, run_date) values ('daily-email', ${date}) on conflict do nothing returning job`;
  if (!claimed.length) return;
  const sent = await sendDailyDigest();
  console.log(`[scheduler] daily email sent to ${sent} subscribers`);
}

export function startScheduler() {
  const g = globalThis as unknown as { __schedulerStarted?: boolean };
  if (g.__schedulerStarted) return;
  g.__schedulerStarted = true;
  const run = () => tick().catch((e) => console.error("[scheduler]", e));
  setTimeout(run, 30_000);
  setInterval(run, 5 * 60_000);
}
