import type { Metadata } from "next";
import Link from "next/link";
import { getUpcomingHillulot } from "@/lib/db";
import { formatGregorian, formatHebrew } from "@/lib/hebrew";

export const metadata: Metadata = { title: "לוח הילולות" };

export default async function HillulotPage() {
  const days = (await getUpcomingHillulot(60)).filter((d, i) => i === 0 || d.tzadikim.length);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">לוח הילולות לחודשיים הקרובים</h1>
      <ul className="card divide-y divide-border">
        {days.map(({ hd, tzadikim }, i) => (
          <li key={hd.toString()} className={`p-3 flex gap-4 flex-wrap ${i === 0 ? "bg-accent-soft" : ""}`}>
            <span className="w-44 shrink-0">
              <span className="font-semibold">{formatHebrew(hd, false)}</span>
              <span className="text-muted text-sm"> · {formatGregorian(hd.greg())}</span>
              {i === 0 && <span className="text-accent text-sm"> (היום)</span>}
            </span>
            <span>
              {tzadikim.length ? tzadikim.map((t, j) => (
                <span key={t.id}>{j > 0 && " · "}<Link className="hover:text-accent" href={`/tzadik/${t.slug}`}>{t.name}</Link></span>
              )) : <span className="text-muted">אין הילולות היום</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">ההילולה מתחילה בערב שלפני התאריך הלועזי המוצג, בשקיעה.</p>
    </div>
  );
}
