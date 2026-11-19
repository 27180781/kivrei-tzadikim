import Link from "next/link";
import type { HillulaEvent, TzadikWithSite } from "@/lib/types";
import { IL_TZ } from "@/lib/hebrew";

export default function EventItem({ e, tzadik }: { e: HillulaEvent; tzadik?: TzadikWithSite | null }) {
  const cancelled = e.status === "cancelled";
  const d = new Date(e.starts_at);
  const day = new Intl.DateTimeFormat("he-IL", { timeZone: IL_TZ, day: "numeric" }).format(d);
  const month = new Intl.DateTimeFormat("he-IL", { timeZone: IL_TZ, month: "short" }).format(d);
  const when = new Intl.DateTimeFormat("he-IL", { timeZone: IL_TZ, weekday: "long", hour: "2-digit", minute: "2-digit" }).format(d);
  return (
    <li className={`card card-hover p-4 flex gap-4 ${cancelled ? "opacity-70" : ""}`}>
      <div className="night-sky rounded-xl w-16 shrink-0 flex flex-col items-center justify-center py-2">
        <span className="font-display text-2xl font-black gold-text leading-none">{day}</span>
        <span className="text-xs text-white/80 mt-1">{month}</span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="font-bold">
            {tzadik ? <Link href={`/tzadik/${tzadik.slug}`} className="hover:text-accent">סעודת הילולה ל{tzadik.name}</Link> : "סעודת הילולה"}
          </span>
          {cancelled ? <span className="chip !bg-red-100 !text-red-800">בוטלה</span>
            : e.status === "updated" ? <span className="chip !bg-amber-100 !text-amber-800">עודכנה</span> : null}
        </div>
        <div className="text-sm text-muted">🕯️ {when}</div>
        {e.location_text || tzadik?.site ? <div className="text-sm">📍 {e.location_text || tzadik?.site?.name}</div> : null}
        {e.organizer ? <div className="text-sm text-muted">מארגן: {e.organizer}{e.contact_phone ? ` · ${e.contact_phone}` : ""}</div> : null}
        {e.details ? <p className="text-sm text-muted mt-1 whitespace-pre-line">{e.details}</p> : null}
      </div>
    </li>
  );
}
