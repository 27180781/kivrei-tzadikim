import "server-only";
import { getTzadikByCode, getTzadikim, getUpcomingEvents, hillulotOn } from "./db";
import { currentHebrewDate, formatDateTime, spokenHebrewDate } from "./hebrew";
import { serviceClient } from "./supabase";

/**
 * מטפל השלוחה (Module API של טכנוליין).
 * המרכזייה שולחת GET עם פרמטרי השיחה, ואנחנו מחזירים JSON של מודול אחד.
 * כל תשובה עם תוכן היא simpleMenu בשם "menu": המאזין שומע את התוכן ואז את התפריט הראשי.
 */

type Params = Record<string, string>;
type Module = Record<string, unknown>;

const MAIN_MENU =
  "לשמיעת ההילולות של היום הקישו 1. להילולות של השבוע הקרוב הקישו 2. " +
  "לחיפוש צדיק לפי מספר הקישו 3. לסעודות הילולה קרובות הקישו 4. " +
  "להרשמה לעדכון טלפוני יומי על ההילולות הקישו 5. לביטול ההרשמה הקישו 6.";

const tts = (...texts: string[]) => texts.filter(Boolean).map((text) => ({ text }));

function menu(content: string[], consumed: string[] = []): Module {
  return {
    type: "simpleMenu",
    name: "menu",
    files: tts(...content, MAIN_MENU),
    enabledKeys: "123456",
    times: 2,
    timeout: 6,
    ...(consumed.length ? { removeParams: consumed } : {}),
  };
}

function callerPhone(p: Params): string | null {
  return p.PBXphone || p.ApiPhone || p.phone || p.caller || null;
}

async function todayText(): Promise<string> {
  const hd = currentHebrewDate();
  const list = hillulotOn(await getTzadikim(), hd);
  const date = spokenHebrewDate(hd);
  if (!list.length) return `היום, ${date}, אין במאגר הילולות.`;
  return `ההילולות של היום, ${date}: ` + list.map((t) => `${t.name}${t.site ? `, ${t.site.name}` : ""}${t.ivr_code ? `, מספר ${t.ivr_code}` : ""}`).join(". ") + ".";
}

async function weekText(): Promise<string> {
  const all = await getTzadikim();
  let hd = currentHebrewDate().next();
  const parts: string[] = [];
  for (let i = 0; i < 7; i++) {
    const list = hillulotOn(all, hd);
    if (list.length) parts.push(`${spokenHebrewDate(hd)}: ${list.map((t) => t.name).join(", ")}`);
    hd = hd.next();
  }
  return parts.length ? "ההילולות בשבוע הקרוב. " + parts.join(". ") + "." : "אין הילולות במאגר בשבוע הקרוב.";
}

async function eventsText(tzadikId?: string): Promise<string> {
  const [events, all] = await Promise.all([getUpcomingEvents({ tzadikId, limit: 5 }), getTzadikim()]);
  const byId = new Map(all.map((t) => [t.id, t]));
  if (!events.length) return tzadikId ? "אין כרגע סעודות הילולה מתוכננות לצדיק זה." : "אין כרגע סעודות הילולה מתוכננות.";
  return "סעודות הילולה קרובות. " + events.map((e) => {
    const t = e.tzadik_id ? byId.get(e.tzadik_id) : null;
    const where = e.location_text || t?.site?.name || "";
    const status = e.status === "cancelled" ? " הסעודה בוטלה." : e.status === "updated" ? " שימו לב, הסעודה עודכנה." : "";
    return `${t ? `סעודת הילולה ל${t.name}` : "סעודת הילולה"}, ${formatDateTime(e.starts_at)}${where ? `, ב${where}` : ""}.${status}`;
  }).join(" ");
}

async function setSubscription(phone: string | null, active: boolean): Promise<string> {
  const sb = serviceClient();
  if (!phone) return "לא זוהה מספר הטלפון שלכם, ולכן לא ניתן לבצע את הפעולה.";
  if (!sb) return "שירות העדכונים עדיין לא פעיל.";
  const { error } = await sb.from("ivr_subscribers").upsert({ phone, active, subscribed_at: new Date().toISOString() });
  if (error) return "אירעה תקלה, נסו שוב מאוחר יותר.";
  return active ? "נרשמתם בהצלחה לעדכון היומי על ההילולות." : "ההרשמה לעדכון היומי בוטלה.";
}

async function log(p: Params, step: string) {
  const sb = serviceClient();
  if (!sb) return;
  await sb.from("ivr_call_log").insert({ caller: callerPhone(p), step, params: p });
}

export async function handleIvr(p: Params): Promise<Module> {
  // הקשת מספר צדיק
  if (p.code !== undefined && p.code !== "") {
    void log(p, "code");
    const t = await getTzadikByCode(Number(p.code));
    if (!t) return menu([`לא נמצא צדיק במספר ${p.code}.`], ["code"]);
    return menu([
      `${t.name}.`,
      t.bio_short ?? "",
      t.site ? `מקום הציון: ${t.site.name}.` : "",
      t.site?.directions ? `דרכי הגעה: ${t.site.directions}` : "",
      await eventsText(t.id),
    ], ["code"]);
  }

  // בחירה בתפריט הראשי
  if (p.menu) {
    void log(p, `menu-${p.menu}`);
    switch (p.menu) {
      case "1": return menu([await todayText()], ["menu"]);
      case "2": return menu([await weekText()], ["menu"]);
      case "3":
        return {
          type: "getDTMF",
          name: "code",
          files: tts("הקישו את מספר הצדיק ובסיומו סולמית."),
          min: 1,
          max: 4,
          timeout: 8,
          removeParams: ["menu"],
        };
      case "4": return menu([await eventsText()], ["menu"]);
      case "5": return menu([await setSubscription(callerPhone(p), true)], ["menu"]);
      case "6": return menu([await setSubscription(callerPhone(p), false)], ["menu"]);
    }
  }

  // כניסה לשלוחה
  void log(p, "start");
  return menu(["שלום וברוכים הבאים לקו קברי הצדיקים.", await todayText()]);
}
