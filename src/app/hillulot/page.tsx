import type { Metadata } from "next";
import Link from "next/link";
import { getUpcomingHillulot } from "@/lib/db";
import { formatGregorian, formatHebrew } from "@/lib/hebrew";
import PageHeader from "@/components/PageHeader";
import AdSlot from "@/components/AdSlot";

export const metadata: Metadata = { title: "לוח הילולות" };

export default async function HillulotPage() {
  const days = (await getUpcomingHillulot(60)).filter((d, i) => i === 0 || d.tzadikim.length);
  return (
    <div>
      <PageHeader title="לוח הילולות" subtitle="ההילולות בחודשיים הקרובים. ההילולה מתחילה בערב שלפני התאריך הלועזי, בשקיעה." />
      <ol className="relative border-r-2 border-gold/40 pr-6 flex flex-col gap-4">
        {days.map(({ hd, tzadikim }, i) => (
          <li key={hd.toString()} className="relative">
            <span className={`absolute -right-[33px] top-5 size-4 rounded-full border-2 border-gold ${i === 0 ? "bg-gold" : "bg-background"}`} />
            <div className={`card p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 ${i === 0 ? "ring-2 ring-gold" : ""}`}>
              <div className="md:w-48 shrink-0">
                <div className="font-display text-xl font-bold">{formatHebrew(hd, false)} {i === 0 && <span className="chip mr-1">היום</span>}</div>
                <div className="text-sm text-muted">{formatGregorian(hd.greg())}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {tzadikim.length ? tzadikim.map((t) => (
                  <Link key={t.id} href={`/tzadik/${t.slug}`} className="btn !py-1.5 text-sm">🕯️ {t.name}</Link>
                )) : <span className="text-muted">אין הילולות היום</span>}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <AdSlot className="mt-10" />
    </div>
  );
}
