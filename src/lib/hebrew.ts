import { HDate, Location, Zmanim, months } from "@hebcal/core";

/** כל החישובים לפי ארץ ישראל: אזור זמן ירושלים ושקיעה בירושלים. */
export const IL_TZ = "Asia/Jerusalem";
const JERUSALEM = Location.lookup("Jerusalem")!;

export const HEBREW_MONTHS: { value: number; label: string }[] = [
  { value: months.TISHREI, label: "תשרי" },
  { value: months.CHESHVAN, label: "חשוון" },
  { value: months.KISLEV, label: "כסלו" },
  { value: months.TEVET, label: "טבת" },
  { value: months.SHVAT, label: "שבט" },
  { value: months.ADAR_I, label: "אדר (אדר א׳ בשנה מעוברת)" },
  { value: months.ADAR_II, label: "אדר ב׳" },
  { value: months.NISAN, label: "ניסן" },
  { value: months.IYYAR, label: "אייר" },
  { value: months.SIVAN, label: "סיוון" },
  { value: months.TAMUZ, label: "תמוז" },
  { value: months.AV, label: "אב" },
  { value: months.ELUL, label: "אלול" },
];

/** התאריך האזרחי בישראל (שנה/חודש/יום) של רגע נתון. */
function israelCivilDate(now: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

/** שעת השקיעה בירושלים ביום האזרחי הנתון. */
export function jerusalemSunset(y: number, m: number, d: number): Date {
  // Zmanim משתמש ברכיבי התאריך המקומיים של האובייקט, לכן בונים אותו מרכיבים
  const z = new Zmanim(JERUSALEM, new Date(y, m - 1, d, 12), false);
  return z.sunset();
}

/**
 * התאריך העברי הנוכחי בארץ ישראל. היום העברי מתחלף בשקיעה (בירושלים), לא בחצות.
 */
export function currentHebrewDate(now: Date = new Date()): HDate {
  const { y, m, d } = israelCivilDate(now);
  const hd = new HDate(new Date(y, m - 1, d, 12));
  const sunset = jerusalemSunset(y, m, d);
  return now.getTime() >= sunset.getTime() ? hd.next() : hd;
}

/**
 * היום/חודש שבו חל יום ההילולה בשנה עברית נתונה.
 * - אדר בשנה פשוטה ↔ אדר ב׳ בשנה מעוברת (המנהג הנפוץ להילולות).
 * - ל׳ בחודש שאין בו ל׳ השנה עובר לא׳ בחודש הבא (חשוון/כסלו), ול׳ אדר א׳ בשנה פשוטה ל-ל׳ שבט.
 */
export function observedHillula(
  deathMonth: number,
  deathDay: number,
  hyear: number,
): { month: number; day: number } {
  const leap = HDate.isLeapYear(hyear);
  let month = deathMonth;
  let day = deathDay;
  if (month === months.ADAR_II && !leap) month = months.ADAR_I;
  else if (month === months.ADAR_I && leap) month = months.ADAR_II;

  if (day === 30 && HDate.daysInMonth(month, hyear) < 30) {
    if (month === months.ADAR_I) {
      month = months.SHVAT; // 30 שבט
    } else {
      const next = new HDate(29, month, hyear).next();
      month = next.getMonth();
      day = next.getDate();
    }
  }
  return { month, day };
}

export function isHillulaOn(
  deathMonth: number | null | undefined,
  deathDay: number | null | undefined,
  hd: HDate,
): boolean {
  if (!deathMonth || !deathDay) return false;
  const o = observedHillula(deathMonth, deathDay, hd.getFullYear());
  return o.month === hd.getMonth() && o.day === hd.getDate();
}

/** "ט׳ כסלו תשפ״ז" (בלי ניקוד) */
export function formatHebrew(hd: HDate, withYear = true): string {
  const s = hd.renderGematriya(true);
  if (withYear) return s;
  return s.split(" ").slice(0, -1).join(" ");
}

export function hebrewDayMonthLabel(month: number, day: number, hyear?: number): string {
  const y = hyear ?? currentHebrewDate().getFullYear();
  const o = observedHillula(month, day, y);
  return formatHebrew(new HDate(o.day, o.month, y), false);
}

/** התאריך האזרחי (בשעון ישראל) שבו מתחיל הערב של יום עברי נתון. */
export function gregorianOf(hd: HDate): Date {
  return hd.greg();
}

export function formatGregorian(d: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: IL_TZ,
    day: "numeric",
    month: "long",
  }).format(d);
}

export function formatDateTime(d: Date | string): string {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: IL_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

const SPOKEN_MONTH: Record<number, string> = {
  1: "ניסן", 2: "אייר", 3: "סיוון", 4: "תמוז", 5: "אב", 6: "אלול", 7: "תשרי",
  8: "חשוון", 9: "כסלו", 10: "טבת", 11: "שבט", 12: "אדר", 13: "אדר שני",
};

/** תאריך להקראה בטלפון: "9 בכסלו" (בשנה מעוברת: "אדר ראשון"/"אדר שני") */
export function spokenHebrewDate(hd: HDate): string {
  const m = hd.getMonth();
  const name = m === 12 && hd.isLeapYear() ? "אדר ראשון" : SPOKEN_MONTH[m];
  return `${hd.getDate()} ב${name}`;
}

export { HDate };
