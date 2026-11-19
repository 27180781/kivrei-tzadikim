import Link from "next/link";
import type { HillulaEvent, TzadikWithSite } from "@/lib/types";
import { formatDateTime } from "@/lib/hebrew";

export default function EventItem({ e, tzadik }: { e: HillulaEvent; tzadik?: TzadikWithSite | null }) {
  const cancelled = e.status === "cancelled";
  return (
    <li className={`card p-4 ${cancelled ? "opacity-70" : ""}`}>
      <div className="flex justify-between gap-2 flex-wrap">
        <div className="font-bold">
          {tzadik ? <Link href={`/tzadik/${tzadik.slug}`} className="hover:text-accent">סעודת הילולה: {tzadik.name}</Link> : "סעודת הילולה"}
        </div>
        {cancelled ? <span className="text-xs bg-red-100 text-red-800 rounded-full px-2 py-1">בוטלה</span>
          : e.status === "updated" ? <span className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-1">עודכנה</span> : null}
      </div>
      <div className="text-sm mt-1">🕯️ {formatDateTime(e.starts_at)}</div>
      {e.location_text || tzadik?.site ? <div className="text-sm">📍 {e.location_text || tzadik?.site?.name}</div> : null}
      {e.organizer ? <div className="text-sm">מארגן: {e.organizer}{e.contact_phone ? ` · ${e.contact_phone}` : ""}</div> : null}
      {e.details ? <p className="text-sm text-muted mt-1 whitespace-pre-line">{e.details}</p> : null}
    </li>
  );
}
