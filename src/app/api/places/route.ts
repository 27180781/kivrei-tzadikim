import { getTzadikim } from "@/lib/db";
import { currentHebrewDate, formatHebrew, hebrewDayMonthLabel, isHillulaOn } from "@/lib/hebrew";

export type Place = {
  id: string;
  slug: string;
  name: string;
  aka: string[];
  siteName: string | null;
  city: string | null;
  lat: number;
  lng: number;
  hillulaLabel: string | null;
  hillulaToday: boolean;
};

/** כל הצדיקים שיש להם מיקום, עם סימון "ההילולה היום" לפי לוח ארץ ישראל (מהשקיעה). */
export async function GET() {
  const hd = currentHebrewDate();
  const all = await getTzadikim();
  const places: Place[] = all
    .filter((t) => t.site?.lat != null && t.site?.lng != null)
    .map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      aka: t.aka ?? [],
      siteName: t.site!.name,
      city: t.site!.city,
      lat: t.site!.lat!,
      lng: t.site!.lng!,
      hillulaLabel: t.hebrew_death_month && t.hebrew_death_day ? hebrewDayMonthLabel(t.hebrew_death_month, t.hebrew_death_day) : null,
      hillulaToday: isHillulaOn(t.hebrew_death_month, t.hebrew_death_day, hd),
    }));
  return Response.json(
    { hebrewDate: formatHebrew(hd), places },
    { headers: { "Cache-Control": "public, s-maxage=300" } },
  );
}
