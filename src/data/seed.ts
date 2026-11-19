/**
 * רשימת ההילולות הראשונית (מתוך hilulot_database.csv של נסים). נטענת אוטומטית למאגר ריק,
 * ומשמשת גם כשאין מסד נתונים. עריכה שוטפת: בממשק הניהול.
 */
import type { HillulaEvent, Photo, Site, Tzadik } from "@/lib/types";

/** גרסת נתוני ההתחלה. מאגר שמכיל רק את נתוני הדוגמה הישנים מוחלף אוטומטית. */
export const SEED_VERSION = 4;
/** כתובות של נתוני הדוגמה מגרסה 1, לזיהוי מאגר שלא נערך */
export const OLD_SAMPLE_SLUGS = ["rashbi","rambam","rabbi-meir-baal-hanes","haari","maran","baba-sali","rachel-imenu","yonatan-ben-uziel","or-hachaim","david-hamelech","rabbi-nachman"];

const site = (s: Partial<Site> & Pick<Site, "id" | "name">): Site => ({
  city: null, address: null, lat: null, lng: null, directions: null,
  public_transport: null, opening_hours: null, accessibility: null, notes: null, ...s,
});

export const seedSites: Site[] = [
  site({"id": "s-1", "name": "ציון רבי אמנון ממגנצא, מיינץ", "city": "מיינץ", "address": "ציון רבי אמנון ממגנצא, מיינץ, גרמניה", "lat": 50.0012, "lng": 8.2591}),
  site({"id": "s-2", "name": "בית העלמין העתיק, צפת", "city": "צפת", "address": "בית העלמין העתיק, צפת", "lat": 32.9698, "lng": 35.4902}),
  site({"id": "s-3", "name": "ציון המהר\"ל מפראג, פראג", "city": "פראג", "address": "ציון המהר\"ל מפראג, פראג, צ'כיה", "lat": 50.0897, "lng": 14.4173}),
  site({"id": "s-4", "name": "בית העלמין סנהדריה, ירושלים", "city": "ירושלים", "address": "בית העלמין סנהדריה, ירושלים", "lat": 31.7975, "lng": 35.2211}),
  site({"id": "s-5", "name": "ציון רבי עקיבא איגר, פוזנן", "city": "פוזנן", "address": "ציון רבי עקיבא איגר, פוזנן, פולין", "lat": 52.4064, "lng": 16.9252}),
  site({"id": "s-6", "name": "לובביץ'", "city": "לובביץ'", "address": "לובביץ', רוסיה", "lat": 54.8333, "lng": 31.0167}),
  site({"id": "s-7", "name": "ציון רבי נחמן מברסלב, אומן", "city": "אומן", "address": "ציון רבי נחמן מברסלב, אומן, אוקראינה", "lat": 48.7487, "lng": 30.2215}),
  site({"id": "s-8", "name": "ציון החת\"ם סופר, ברטיסלבה", "city": "ברטיסלבה", "address": "ציון החת\"ם סופר, ברטיסלבה, סלובקיה", "lat": 48.1419, "lng": 17.0942}),
  site({"id": "s-9", "name": "ציון רבי לוי יצחק מברדיטשוב, ברדיטשוב", "city": "ברדיטשוב", "address": "ציון רבי לוי יצחק מברדיטשוב, ברדיטשוב, אוקראינה", "lat": 49.8992, "lng": 28.5903}),
  site({"id": "s-10", "name": "הר המנוחות, ירושלים", "city": "ירושלים", "address": "הר המנוחות, ירושלים", "lat": 31.7917, "lng": 35.1778}),
  site({"id": "s-11", "name": "קבר רחל, בית לחם", "city": "בית לחם", "address": "קבר רחל, בית לחם", "lat": 31.7192, "lng": 35.2022}),
  site({"id": "s-12", "name": "ציון רבי מנחם נחום מצ'רנוביל, צ'רנוביל", "city": "צ'רנוביל", "address": "ציון רבי מנחם נחום מצ'רנוביל, צ'רנוביל, אוקראינה", "lat": 51.2763, "lng": 30.2219}),
  site({"id": "s-13", "name": "ציון רבי שלום דובער שניאורסון, רוסטוב על הדון", "city": "רוסטוב על הדון", "address": "ציון רבי שלום דובער שניאורסון, רוסטוב על הדון, רוסיה", "lat": 47.2357, "lng": 39.7015}),
  site({"id": "s-14", "name": "ציון רבי דוב בער שניאורי, ניעז'ין", "city": "ניעז'ין", "address": "ציון רבי דוב בער שניאורי, ניעז'ין, אוקראינה", "lat": 51.0486, "lng": 31.8869}),
  site({"id": "s-15", "name": "נבי רובין / פלמחים", "city": "נבי רובין / פלמחים", "address": "נבי רובין / פלמחים", "lat": 31.9308, "lng": 34.7253}),
  site({"id": "s-16", "name": "ציון רבי דוב בער המגיד ממזריטש, האניפולי", "city": "האניפולי", "address": "ציון רבי דוב בער המגיד ממזריטש, האניפולי, אוקראינה", "lat": 50.3347, "lng": 26.8758}),
  site({"id": "s-17", "name": "ציון רבי אבנר צרפתי, פאס", "city": "פאס", "address": "ציון רבי אבנר צרפתי, פאס, מרוקו", "lat": 34.0331, "lng": -5.0003}),
  site({"id": "s-18", "name": "ציון רבי נתן שטרנהרץ, ברסלב", "city": "ברסלב", "address": "ציון רבי נתן שטרנהרץ, ברסלב, אוקראינה", "lat": 48.8189, "lng": 28.9436}),
  site({"id": "s-19", "name": "ציון הרמב\"ם, טבריה", "city": "טבריה", "address": "ציון הרמב\"ם, טבריה", "lat": 32.7959, "lng": 35.5312}),
  site({"id": "s-20", "name": "ציון רבי שניאור זלמן מלאדי, האדיטש", "city": "האדיטש", "address": "ציון רבי שניאור זלמן מלאדי, האדיטש, אוקראינה", "lat": 50.3667, "lng": 33.9833}),
  site({"id": "s-21", "name": "ציון רבי ישראל אבוחצירא, נתיבות", "city": "נתיבות", "address": "ציון רבי ישראל אבוחצירא, נתיבות", "lat": 31.4231, "lng": 34.5889}),
  site({"id": "s-22", "name": "קווינס, ניו יורק", "city": "ניו יורק", "address": "קווינס, ניו יורק, ארה\"ב", "lat": 40.6844, "lng": -73.7431}),
  site({"id": "s-23", "name": "הר הזיתים, ירושלים", "city": "ירושלים", "address": "הר הזיתים, ירושלים", "lat": 31.7767, "lng": 35.2433}),
  site({"id": "s-24", "name": "ציון רבי מנחם מנדל מקוצק, קוצק", "city": "קוצק", "address": "ציון רבי מנחם מנדל מקוצק, קוצק, פולין", "lat": 51.6414, "lng": 22.4436}),
  site({"id": "s-25", "name": "ציון רבי אלימלך מליז'נסק, ליז'נסק", "city": "ליז'נסק", "address": "ציון רבי אלימלך מליז'נסק, ליז'נסק, פולין", "lat": 50.2614, "lng": 22.4194}),
  site({"id": "s-26", "name": "ציון רבי נחמן מהורדנקא, טבריה", "city": "טבריה", "address": "ציון רבי נחמן מהורדנקא, טבריה", "lat": 32.785, "lng": 35.535}),
  site({"id": "s-27", "name": "ציון יהושע בן נון, כיפל חארת' (תמנת חרס)", "city": "כיפל חארת' (תמנת חרס)", "address": "ציון יהושע בן נון, כיפל חארת' (תמנת חרס)", "lat": 32.1186, "lng": 35.1558}),
  site({"id": "s-28", "name": "ציון רבי מאיר בעל הנס, טבריה", "city": "טבריה", "address": "ציון רבי מאיר בעל הנס, טבריה", "lat": 32.7681, "lng": 35.5489}),
  site({"id": "s-29", "name": "ציון הרשב\"י, מירון", "city": "מירון", "address": "ציון הרשב\"י, מירון", "lat": 32.9825, "lng": 35.4422}),
  site({"id": "s-30", "name": "נבי סמואל, ירושלים", "city": "ירושלים", "address": "נבי סמואל, ירושלים", "lat": 31.8328, "lng": 35.1803}),
  site({"id": "s-31", "name": "הר ציון, ירושלים", "city": "ירושלים", "address": "הר ציון, ירושלים", "lat": 31.7717, "lng": 35.2292}),
  site({"id": "s-32", "name": "ציון הבעש\"ט, מז'יבוז'", "city": "מז'יבוז'", "address": "ציון הבעש\"ט, מז'יבוז', אוקראינה", "lat": 49.4394, "lng": 27.4119}),
  site({"id": "s-33", "name": "ציון רבי חיים מוולוז'ין, וולוז'ין", "city": "וולוז'ין", "address": "ציון רבי חיים מוולוז'ין, וולוז'ין, בלארוס", "lat": 54.0908, "lng": 26.5275}),
  site({"id": "s-34", "name": "הר ההר, פטרה", "city": "פטרה", "address": "הר ההר, פטרה, ירדן", "lat": 30.3175, "lng": 35.4067}),
  site({"id": "s-35", "name": "ציון רבי ישראל מאיר הכהן מראדין, ראדין", "city": "ראדין", "address": "ציון רבי ישראל מאיר הכהן מראדין, ראדין, בלארוס", "lat": 54.0489, "lng": 24.9875}),
];

const tz = (t: Partial<Tzadik> & Pick<Tzadik, "id" | "name" | "slug">): Tzadik => ({
  ivr_code: null, aka: null, bio: null, bio_short: null, hebrew_death_day: null,
  hebrew_death_month: null, death_year_hebrew: null, site_id: null, is_published: true, ...t,
});

// חודשים לפי מספור hebcal: 1 ניסן ... 7 תשרי ... 12 אדר, 13 אדר ב׳
export const seedTzadikim: Tzadik[] = [
  tz({"id": "t-amnon-mainz", "ivr_code": 1, "name": "רבי אמנון ממגנצא", "slug": "amnon-mainz", "hebrew_death_month": 7, "hebrew_death_day": 1, "site_id": "s-1", "bio_short": "בעל 'ונתנה תוקף'"}),
  tz({"id": "t-avraham-berukhim", "ivr_code": 2, "name": "רבי אברהם הלוי ברוכים", "slug": "avraham-berukhim", "hebrew_death_month": 7, "hebrew_death_day": 3, "site_id": "s-2", "bio_short": "בעל 'תיקון חצות' מתלמידי האר\"י"}),
  tz({"id": "t-maharal", "ivr_code": 3, "name": "רבי יהודה ליב (המהר\"ל מפראג)", "slug": "maharal", "hebrew_death_month": 7, "hebrew_death_day": 6, "site_id": "s-3", "bio_short": "גור אריה"}),
  tz({"id": "t-ovadia-yosef", "ivr_code": 4, "name": "הרב עובדיה יוסף", "slug": "ovadia-yosef", "hebrew_death_month": 7, "hebrew_death_day": 9, "site_id": "s-4", "bio_short": "מרן הראשון לציון"}),
  tz({"id": "t-akiva-eiger", "ivr_code": 5, "name": "רבי עקיבא איגר", "slug": "akiva-eiger", "hebrew_death_month": 7, "hebrew_death_day": 13, "site_id": "s-5", "bio_short": "גאון ישראל"}),
  tz({"id": "t-maharash", "ivr_code": 6, "name": "רבי שמואל שניאורסון (המהר\"ש)", "slug": "maharash", "hebrew_death_month": 7, "hebrew_death_day": 13, "site_id": "s-6", "bio_short": "האדמו\"ר המהר\"ש מחב\"ד"}),
  tz({"id": "t-rabbi-nachman", "ivr_code": 7, "name": "רבי נחמן מברסלב", "slug": "rabbi-nachman", "hebrew_death_month": 7, "hebrew_death_day": 18, "site_id": "s-7", "bio_short": "מוהר\"ן"}),
  tz({"id": "t-chatam-sofer", "ivr_code": 8, "name": "רבי משה סופר (החת\"ם סופר)", "slug": "chatam-sofer", "hebrew_death_month": 7, "hebrew_death_day": 25, "site_id": "s-8", "bio_short": "ראש ישיבת פרשבורג"}),
  tz({"id": "t-berditchev", "ivr_code": 9, "name": "רבי לוי יצחק מברדיטשוב", "slug": "berditchev", "hebrew_death_month": 7, "hebrew_death_day": 25, "site_id": "s-9", "bio_short": "סנגורן של ישראל (קדושת לוי)"}),
  tz({"id": "t-meir-shapiro", "ivr_code": 10, "name": "רבי מאיר שפירא מלובלין", "slug": "meir-shapiro", "hebrew_death_month": 8, "hebrew_death_day": 7, "site_id": "s-10", "bio_short": "מחולל הדף היומי"}),
  tz({"id": "t-rachel-imeinu", "ivr_code": 11, "name": "רחל אמנו", "slug": "rachel-imeinu", "hebrew_death_month": 8, "hebrew_death_day": 11, "site_id": "s-11", "bio_short": "אם האומה"}),
  tz({"id": "t-chernobyl", "ivr_code": 12, "name": "רבי מנחם נחום מצ'רנוביל", "slug": "chernobyl", "hebrew_death_month": 8, "hebrew_death_day": 11, "site_id": "s-12", "bio_short": "המאור עיניים"}),
  tz({"id": "t-rashab", "ivr_code": 13, "name": "רבי שלום דובער שניאורסון (הרש\"ב)", "slug": "rashab", "hebrew_death_month": 8, "hebrew_death_day": 20, "site_id": "s-13", "bio_short": "האדמו\"ר הרש\"ב מחב\"ד"}),
  tz({"id": "t-mitteler-rebbe", "ivr_code": 14, "name": "רבי דוב בער שניאורי (האדמו\"ר האמצעי)", "slug": "mitteler-rebbe", "hebrew_death_month": 9, "hebrew_death_day": 9, "site_id": "s-14", "bio_short": "האדמו\"ר האמצעי מחב\"ד"}),
  tz({"id": "t-reuven", "ivr_code": 15, "name": "ראובן בן יעקב אבינו", "slug": "reuven", "hebrew_death_month": 9, "hebrew_death_day": 14, "site_id": "s-15", "bio_short": "בכור השבטים"}),
  tz({"id": "t-maggid-mezritch", "ivr_code": 16, "name": "רבי דוב בער המגיד ממזריטש", "slug": "maggid-mezritch", "hebrew_death_month": 9, "hebrew_death_day": 19, "site_id": "s-16", "bio_short": "תלמיד הבעש\"ט"}),
  tz({"id": "t-avner-tzarfati", "ivr_code": 17, "name": "רבי אבנר צרפתי", "slug": "avner-tzarfati", "hebrew_death_month": 10, "hebrew_death_day": 5, "site_id": "s-17", "bio_short": "מגדולי רבני מרוקו"}),
  tz({"id": "t-nathan-breslov", "ivr_code": 18, "name": "רבי נתן שטרנהרץ", "slug": "nathan-breslov", "hebrew_death_month": 10, "hebrew_death_day": 10, "site_id": "s-18", "bio_short": "מוהרנ\"ת מברסלב"}),
  tz({"id": "t-rambam", "ivr_code": 19, "name": "רבי משה בן מימון (הרמב\"ם)", "slug": "rambam", "hebrew_death_month": 10, "hebrew_death_day": 20, "site_id": "s-19", "bio_short": "הנשר הגדול"}),
  tz({"id": "t-baal-hatanya", "ivr_code": 20, "name": "רבי שניאור זלמן מלאדי", "slug": "baal-hatanya", "hebrew_death_month": 10, "hebrew_death_day": 24, "site_id": "s-20", "bio_short": "בעל התניא והשולחן ערוך הרב"}),
  tz({"id": "t-baba-sali", "ivr_code": 21, "name": "רבי ישראל אבוחצירא", "slug": "baba-sali", "hebrew_death_month": 11, "hebrew_death_day": 4, "site_id": "s-21", "bio_short": "הבבא סאלי"}),
  tz({"id": "t-rayatz", "ivr_code": 22, "name": "רבי יוסף יצחק שניאורסון (הריי\"צ)", "slug": "rayatz", "hebrew_death_month": 11, "hebrew_death_day": 10, "site_id": "s-22", "bio_short": "האדמו\"ר הריי\"צ מחב\"ד"}),
  tz({"id": "t-rashash", "ivr_code": 23, "name": "רבי שלום שרעבי (הרש\"ש)", "slug": "rashash", "hebrew_death_month": 11, "hebrew_death_day": 10, "site_id": "s-23", "bio_short": "ראש ישיבת המקובלים בית אל"}),
  tz({"id": "t-kotzk", "ivr_code": 24, "name": "רבי מנחם מנדל מקוצק", "slug": "kotzk", "hebrew_death_month": 11, "hebrew_death_day": 22, "site_id": "s-24", "bio_short": "השרף מקוצק"}),
  tz({"id": "t-moshe-rabbeinu", "ivr_code": 25, "name": "משה רבנו", "slug": "moshe-rabbeinu", "hebrew_death_month": 12, "hebrew_death_day": 7, "site_id": null, "bio_short": "אדון הנביאים"}),
  tz({"id": "t-noam-elimelech", "ivr_code": 26, "name": "רבי אלימלך מליז'נסק", "slug": "noam-elimelech", "hebrew_death_month": 12, "hebrew_death_day": 21, "site_id": "s-25", "bio_short": "בעל 'נועם אלימלך'"}),
  tz({"id": "t-nachman-horodenka", "ivr_code": 27, "name": "רבי נחמן מהורדנקא", "slug": "nachman-horodenka", "hebrew_death_month": 1, "hebrew_death_day": 1, "site_id": "s-26", "bio_short": "סבו של רבי נחמן מברסלב"}),
  tz({"id": "t-tzemach-tzedek", "ivr_code": 28, "name": "רבי מנחם מנדל שניאורסון (הצמח צדק)", "slug": "tzemach-tzedek", "hebrew_death_month": 1, "hebrew_death_day": 13, "site_id": "s-6", "bio_short": "האדמו\"ר הצמח צדק מחב\"ד"}),
  tz({"id": "t-yehoshua-bin-nun", "ivr_code": 29, "name": "יהושע בן נון", "slug": "yehoshua-bin-nun", "hebrew_death_month": 1, "hebrew_death_day": 26, "site_id": "s-27", "bio_short": "מנחיל הארץ"}),
  tz({"id": "t-rabbi-meir", "ivr_code": 30, "name": "רבי מאיר בעל הנס", "slug": "rabbi-meir", "hebrew_death_month": 2, "hebrew_death_day": 14, "site_id": "s-28", "bio_short": "תנא קדוש (פסח שני)"}),
  tz({"id": "t-rashbi", "ivr_code": 31, "name": "רבי שמעון בר יוחאי (הרשב\"י)", "slug": "rashbi", "hebrew_death_month": 2, "hebrew_death_day": 18, "site_id": "s-29", "bio_short": "בעל הזוהר הקדוש (ל\"ג בעומר)"}),
  tz({"id": "t-shmuel-hanavi", "ivr_code": 32, "name": "שמואל הנביא", "slug": "shmuel-hanavi", "hebrew_death_month": 2, "hebrew_death_day": 28, "site_id": "s-30", "bio_short": "שופט ונביא ישראל"}),
  tz({"id": "t-david-hamelech", "ivr_code": 33, "name": "דוד המלך", "slug": "david-hamelech", "hebrew_death_month": 3, "hebrew_death_day": 6, "site_id": "s-31", "bio_short": "נעים זמירות ישראל (חג השבועות)"}),
  tz({"id": "t-baal-shem-tov", "ivr_code": 34, "name": "רבי ישראל בעל שם טוב (הבעש\"ט)", "slug": "baal-shem-tov", "hebrew_death_month": 3, "hebrew_death_day": 6, "site_id": "s-32", "bio_short": "מייסד תנועת החסידות"}),
  tz({"id": "t-chaim-volozhin", "ivr_code": 35, "name": "רבי חיים מוולוז'ין", "slug": "chaim-volozhin", "hebrew_death_month": 3, "hebrew_death_day": 14, "site_id": "s-33", "bio_short": "אבי עולם הישיבות (נפש החיים)"}),
  tz({"id": "t-lubavitcher-rebbe", "ivr_code": 36, "name": "רבי מנחם מנדל שניאורסון (הרבי מליובאוויטש)", "slug": "lubavitcher-rebbe", "hebrew_death_month": 4, "hebrew_death_day": 3, "site_id": "s-22", "bio_short": "הרבי מליובאוויטש"}),
  tz({"id": "t-or-hachaim", "ivr_code": 37, "name": "רבי חיים בן עטר", "slug": "or-hachaim", "hebrew_death_month": 4, "hebrew_death_day": 15, "site_id": "s-23", "bio_short": "בעל 'אור החיים' הקדוש"}),
  tz({"id": "t-aharon-hakohen", "ivr_code": 38, "name": "אהרן הכהן", "slug": "aharon-hakohen", "hebrew_death_month": 5, "hebrew_death_day": 1, "site_id": "s-34", "bio_short": "אוהב שלום ורודף שלום"}),
  tz({"id": "t-arizal", "ivr_code": 39, "name": "רבי יצחק לוריא אשכנזי (האר\"י הקדוש)", "slug": "arizal", "hebrew_death_month": 5, "hebrew_death_day": 5, "site_id": "s-2", "bio_short": "אבי תורת הקבלה"}),
  tz({"id": "t-chafetz-chaim", "ivr_code": 40, "name": "רבי ישראל מאיר הכהן מראדין", "slug": "chafetz-chaim", "hebrew_death_month": 6, "hebrew_death_day": 24, "site_id": "s-35", "bio_short": "החפץ חיים"}),
];

export const seedPhotos: Photo[] = [];

export const seedEvents: HillulaEvent[] = [];
