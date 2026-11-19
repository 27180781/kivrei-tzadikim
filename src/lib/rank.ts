import { distanceKm } from "./nav";

export type Rankable = {
  name: string;
  aka: string[];
  siteName: string | null;
  city: string | null;
  lat: number;
  lng: number;
  hillulaToday: boolean;
};

export type Ranked<T> = T & { distance: number | null; featured: boolean };

const norm = (s: string | null | undefined) =>
  (s ?? "").replace(/["׳״'`]/g, "").replace(/\s+/g, " ").trim();

/**
 * סדר התצוגה באפליקציה:
 * 1. עד 3 קברים שההילולה שלהם חלה היום, לפי קרבה.
 * 2. אחריהם כל השאר לפי קרבה.
 * "מחוץ לעיר": מסתיר קברים בעיר שבה המשתמש נמצא, חוץ מקברים שההילולה שלהם היום.
 * חיפוש: מסנן לפי שם, כינוי, שם המקום או עיר.
 */
export function rankPlaces<T extends Rankable>(
  places: T[],
  opts: { here: { lat: number; lng: number } | null; userCity: string | null; outOfCity: boolean; query: string },
): Ranked<T>[] {
  const { here, userCity, outOfCity } = opts;
  const q = norm(opts.query);
  const withDist: Ranked<T>[] = places.map((p) => ({
    ...p,
    distance: here ? distanceKm(here, p) : null,
    featured: false,
  }));

  const inUserCity = (p: Ranked<T>) => {
    if (userCity && p.city) return norm(p.city) === norm(userCity);
    // אין שם עיר להשוואה: נחשב "בעיר" אם המרחק קטן מ-5 ק״מ
    return p.distance != null && p.distance < 5;
  };

  let list = withDist;
  if (q) {
    list = list.filter((p) => [p.name, p.siteName, p.city, ...p.aka].some((s) => norm(s).includes(q)));
  }
  if (outOfCity && here) {
    list = list.filter((p) => p.hillulaToday || !inUserCity(p));
  }

  const byDist = (a: Ranked<T>, b: Ranked<T>) =>
    a.distance != null && b.distance != null ? a.distance - b.distance : a.name.localeCompare(b.name, "he");

  const today = list.filter((p) => p.hillulaToday).sort(byDist).slice(0, 3);
  const featuredSet = new Set(today);
  const rest = list.filter((p) => !featuredSet.has(p)).sort(byDist);
  return [...today.map((p) => ({ ...p, featured: true })), ...rest];
}
