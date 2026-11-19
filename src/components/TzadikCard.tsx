import Link from "next/link";
import type { TzadikWithSite } from "@/lib/types";
import { hebrewDayMonthLabel } from "@/lib/hebrew";
import NavButtons from "./NavButtons";

export default function TzadikCard({ t, highlight }: { t: TzadikWithSite; highlight?: boolean }) {
  return (
    <div className={`card p-4 flex flex-col gap-2 ${highlight ? "ring-2 ring-accent" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/tzadik/${t.slug}`} className="text-lg font-bold hover:text-accent">{t.name}</Link>
          {t.aka?.length ? <div className="text-sm text-muted">{t.aka.join(" · ")}</div> : null}
        </div>
        {t.hebrew_death_month && t.hebrew_death_day ? (
          <span className="text-xs bg-accent-soft text-accent rounded-full px-2 py-1 whitespace-nowrap">
            הילולה: {hebrewDayMonthLabel(t.hebrew_death_month, t.hebrew_death_day)}
          </span>
        ) : null}
      </div>
      {t.site ? <div className="text-sm">📍 {t.site.name}</div> : null}
      {t.bio_short ? <p className="text-sm text-muted">{t.bio_short}</p> : null}
      {t.site?.lat && t.site?.lng ? <NavButtons lat={t.site.lat} lng={t.site.lng} /> : null}
    </div>
  );
}
