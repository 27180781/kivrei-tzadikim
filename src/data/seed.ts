/**
 * נתוני דוגמה בלבד, כדי שהאתר יעבוד לפני חיבור Supabase.
 * תאריכים וקואורדינטות משוערים: יש לאמת לפני העלאה לאוויר.
 */
import type { HillulaEvent, Photo, Site, Tzadik } from "@/lib/types";

const site = (s: Partial<Site> & Pick<Site, "id" | "name">): Site => ({
  city: null, address: null, lat: null, lng: null, directions: null,
  public_transport: null, opening_hours: null, accessibility: null, notes: null, ...s,
});

export const seedSites: Site[] = [
  site({ id: "s-meron", name: "ציון רשב״י, מירון", city: "מירון", lat: 32.9808, lng: 35.4398,
    directions: "מכביש 89 פונים לכיוון מירון ועוקבים אחר השילוט לציון.", public_transport: "קווים מצפת ומבני ברק." }),
  site({ id: "s-rambam", name: "קבר הרמב״ם, טבריה", city: "טבריה", lat: 32.7893, lng: 35.5378,
    directions: "רחוב בן זכאי בטבריה, ליד מרכז העיר." }),
  site({ id: "s-rmbh", name: "ציון רבי מאיר בעל הנס, טבריה", city: "טבריה", lat: 32.7686, lng: 35.5487,
    directions: "בדרום טבריה, מעל חמי טבריה." }),
  site({ id: "s-ari", name: "בית העלמין העתיק, צפת", city: "צפת", lat: 32.9655, lng: 35.4924,
    directions: "יורדים מהעיר העתיקה בצפת במדרגות לבית העלמין." }),
  site({ id: "s-babasali", name: "ציון הבבא סאלי, נתיבות", city: "נתיבות", lat: 31.4176, lng: 34.5836,
    directions: "בכניסה לנתיבות, שילוט מכביש 25." }),
  site({ id: "s-rachel", name: "קבר רחל, בית לחם", city: "בית לחם", lat: 31.7193, lng: 35.2024,
    directions: "נסיעה ברכב ממוגן או באוטובוס ממוגן מירושלים.", public_transport: "קו 163 מירושלים." }),
  site({ id: "s-amuka", name: "ציון רבי יונתן בן עוזיאל, עמוקה", city: "עמוקה", lat: 32.9989, lng: 35.5195,
    directions: "מצפת בכביש 8900 לכיוון עמוקה." }),
  site({ id: "s-orhachaim", name: "הר הזיתים, ירושלים", city: "ירושלים", lat: 31.7784, lng: 35.2418,
    directions: "הר הזיתים, ירושלים." }),
  site({ id: "s-david", name: "קבר דוד המלך, הר ציון", city: "ירושלים", lat: 31.7717, lng: 35.2291,
    directions: "הר ציון, מחוץ לחומות העיר העתיקה ליד שער ציון." }),
  site({ id: "s-uman", name: "ציון רבי נחמן, אומן", city: "אומן", lat: 48.7474, lng: 30.2219,
    directions: "אומן, אוקראינה." }),
];

const tz = (t: Partial<Tzadik> & Pick<Tzadik, "id" | "name" | "slug">): Tzadik => ({
  ivr_code: null, aka: null, bio: null, bio_short: null, hebrew_death_day: null,
  hebrew_death_month: null, death_year_hebrew: null, site_id: null, is_published: true, ...t,
});

// חודשים לפי מספור hebcal: 1 ניסן ... 7 תשרי ... 12 אדר, 13 אדר ב׳
export const seedTzadikim: Tzadik[] = [
  tz({ id: "t-rashbi", ivr_code: 1, name: "רבי שמעון בר יוחאי", aka: ["הרשב״י"], slug: "rashbi",
    hebrew_death_month: 2, hebrew_death_day: 18, site_id: "s-meron",
    bio_short: "התנא האלוקי, מחבר ספר הזוהר. ההילולה בל״ג בעומר.",
    bio: "רבי שמעון בר יוחאי, מגדולי התנאים, תלמידו של רבי עקיבא. לפי המסורת חיבר את ספר הזוהר. יום ההילולה שלו, ל״ג בעומר, נחגג במירון בהשתתפות רבבות." }),
  tz({ id: "t-rambam", ivr_code: 2, name: "רבנו משה בן מימון", aka: ["הרמב״ם"], slug: "rambam",
    hebrew_death_month: 10, hebrew_death_day: 20, site_id: "s-rambam",
    bio_short: "מגדולי הפוסקים והפילוסופים, מחבר משנה תורה.",
    bio: "הרמב״ם, מחבר משנה תורה, מורה נבוכים ופירוש המשניות. נפטר במצרים והובא לקבורה בטבריה." }),
  tz({ id: "t-rmbh", ivr_code: 3, name: "רבי מאיר בעל הנס", slug: "rabbi-meir-baal-hanes",
    hebrew_death_month: 2, hebrew_death_day: 14, site_id: "s-rmbh",
    bio_short: "התנא רבי מאיר. ההילולה בפסח שני.",
    bio: "רבי מאיר, מגדולי התנאים, תלמידו של רבי עקיבא. ציונו בטבריה, וההילולה נערכת בפסח שני." }),
  tz({ id: "t-ari", ivr_code: 4, name: "רבי יצחק לוריא", aka: ["האר״י הקדוש"], slug: "haari",
    hebrew_death_month: 5, hebrew_death_day: 5, site_id: "s-ari",
    bio_short: "האר״י הקדוש, אבי תורת הקבלה של צפת.",
    bio: "רבי יצחק לוריא אשכנזי, האר״י הקדוש, מגדולי המקובלים. פעל בצפת ונפטר בה בצעירותו." }),
  tz({ id: "t-maran", ivr_code: 5, name: "רבי יוסף קארו", aka: ["מרן", "הבית יוסף"], slug: "maran",
    hebrew_death_month: 1, hebrew_death_day: 13, site_id: "s-ari",
    bio_short: "מרן הבית יוסף, מחבר השולחן ערוך.",
    bio: "רבי יוסף קארו, מחבר הבית יוסף והשולחן ערוך. ישב בצפת ונקבר בבית העלמין העתיק." }),
  tz({ id: "t-babasali", ivr_code: 6, name: "רבי ישראל אבוחצירא", aka: ["הבבא סאלי"], slug: "baba-sali",
    hebrew_death_month: 11, hebrew_death_day: 4, site_id: "s-babasali",
    bio_short: "הבבא סאלי, מגדולי צדיקי מרוקו, ציונו בנתיבות.",
    bio: "רבי ישראל אבוחצירא, הבבא סאלי, עלה ממרוקו והתיישב בנתיבות. ההילולה בד׳ בשבט." }),
  tz({ id: "t-rachel", ivr_code: 7, name: "רחל אמנו", slug: "rachel-imenu",
    hebrew_death_month: 8, hebrew_death_day: 11, site_id: "s-rachel",
    bio_short: "רחל אמנו, אם ישראל. יום פטירתה בי״א בחשוון.",
    bio: "רחל אמנו, אשת יעקב אבינו, נקברה בדרך אפרתה היא בית לחם." }),
  tz({ id: "t-yonatan", ivr_code: 8, name: "רבי יונתן בן עוזיאל", slug: "yonatan-ben-uziel",
    hebrew_death_month: 3, hebrew_death_day: 26, site_id: "s-amuka",
    bio_short: "התנא רבי יונתן בן עוזיאל, ציונו בעמוקה.",
    bio: "רבי יונתן בן עוזיאל, גדול תלמידי הלל הזקן ומחבר תרגום יונתן לנביאים. ציונו בעמוקה." }),
  tz({ id: "t-orhachaim", ivr_code: 9, name: "רבי חיים בן עטר", aka: ["האור החיים הקדוש"], slug: "or-hachaim",
    hebrew_death_month: 4, hebrew_death_day: 15, site_id: "s-orhachaim",
    bio_short: "האור החיים הקדוש, ציונו בהר הזיתים.",
    bio: "רבי חיים בן עטר, מחבר פירוש אור החיים על התורה. עלה ממרוקו לירושלים ונקבר בהר הזיתים." }),
  tz({ id: "t-david", ivr_code: 10, name: "דוד המלך", slug: "david-hamelech",
    hebrew_death_month: 3, hebrew_death_day: 6, site_id: "s-david",
    bio_short: "נעים זמירות ישראל. יום ההילולה בחג השבועות.",
    bio: "דוד המלך, מלך ישראל ומחבר ספר תהלים. לפי המסורת נפטר בחג השבועות." }),
  tz({ id: "t-nachman", ivr_code: 11, name: "רבי נחמן מברסלב", slug: "rabbi-nachman",
    hebrew_death_month: 7, hebrew_death_day: 18, site_id: "s-uman",
    bio_short: "רבי נחמן מברסלב, ציונו באומן.",
    bio: "רבי נחמן מברסלב, נינו של הבעל שם טוב, מחבר ליקוטי מוהר״ן. נקבר באומן." }),
];

export const seedPhotos: Photo[] = [];

export const seedEvents: HillulaEvent[] = [];
