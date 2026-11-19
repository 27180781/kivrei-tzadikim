import Link from "next/link";
import type { TzadikWithSite } from "@/lib/types";
import { hebrewDayMonthLabel } from "@/lib/hebrew";
import { googleMapsUrl, wazeUrl } from "@/lib/nav";

export function Monogram({ name, className = "" }: { name: string; className?: string }) {
  const letter = name.replace(/^(רבי|רבנו|רב|הרב)\s+/, "").trim().charAt(0);
  return (
    <div className={`night-sky flex items-center justify-center ${className}`}>
      <span className="font-display gold-text text-5xl font-black">{letter}</span>
    </div>
  );
}

export default function TzadikCard({ t, highlight }: { t: TzadikWithSite; highlight?: boolean }) {
  return (
    <article className={`card card-hover overflow-hidden flex flex-col ${highlight ? "ring-2 ring-gold" : ""}`}>
      <Link href={`/tzadik/${t.slug}`} className="relative block h-36">
        {t.cover_photo_id ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/photos/${t.cover_photo_id}`} alt={t.name} className="h-full w-full object-cover" />
        ) : (
          <Monogram name={t.name} className="h-full w-full" />
        )}
        {highlight && <span className="absolute top-3 right-3 chip !bg-gold !text-night">🕯️ ההילולה היום</span>}
      </Link>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <Link href={`/tzadik/${t.slug}`} className="font-display text-xl font-bold hover:text-accent">{t.name}</Link>
          {t.aka?.length ? <div className="text-sm text-muted">{t.aka.join(" · ")}</div> : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {t.hebrew_death_month && t.hebrew_death_day ? (
            <span className="chip">הילולה: {hebrewDayMonthLabel(t.hebrew_death_month, t.hebrew_death_day)}</span>
          ) : null}
          {t.site?.city ? <span className="chip !bg-transparent border border-border !text-muted">📍 {t.site.city}</span> : null}
        </div>
        {t.bio_short ? <p className="text-sm text-muted leading-6 line-clamp-2">{t.bio_short}</p> : null}
        {t.site?.lat && t.site?.lng ? (
          <div className="flex gap-2 mt-auto pt-2 text-sm">
            <a className="btn btn-primary flex-1 !py-1.5" href={wazeUrl(t.site.lat, t.site.lng)} target="_blank" rel="noopener">Waze</a>
            <a className="btn flex-1 !py-1.5" href={googleMapsUrl(t.site.lat, t.site.lng)} target="_blank" rel="noopener">Google Maps</a>
          </div>
        ) : null}
      </div>
    </article>
  );
}
