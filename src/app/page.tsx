import Link from "next/link";
import { getTzadikim, getUpcomingEvents, getUpcomingHillulot } from "@/lib/db";
import { formatGregorian, formatHebrew } from "@/lib/hebrew";
import TzadikCard from "@/components/TzadikCard";
import EventItem from "@/components/EventItem";

export default async function Home() {
  const [days, events, all] = await Promise.all([getUpcomingHillulot(8), getUpcomingEvents({ limit: 6 }), getTzadikim()]);
  const [today, ...next] = days;
  const byId = new Map(all.map((t) => [t.id, t]));

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
          <h1 className="text-2xl font-bold">הילולות היום</h1>
          <div className="text-muted">{formatHebrew(today.hd)} · {formatGregorian(today.hd.greg())}</div>
        </div>
        {today.tzadikim.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {today.tzadikim.map((t) => <TzadikCard key={t.id} t={t} highlight />)}
          </div>
        ) : (
          <p className="card p-4 text-muted">אין במאגר הילולות שחלות היום.</p>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-bold">סעודות הילולה קרובות</h2>
          <Link href="/seudot" className="text-accent text-sm">לכל הסעודות</Link>
        </div>
        {events.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {events.map((e) => <EventItem key={e.id} e={e} tzadik={e.tzadik_id ? byId.get(e.tzadik_id) : null} />)}
          </ul>
        ) : <p className="card p-4 text-muted">אין כרגע סעודות מתוכננות.</p>}
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-bold">השבוע הקרוב</h2>
          <Link href="/hillulot" className="text-accent text-sm">לוח הילולות מלא</Link>
        </div>
        <ul className="card divide-y divide-border">
          {next.map(({ hd, tzadikim }) => (
            <li key={hd.toString()} className="p-3 flex gap-4 flex-wrap">
              <span className="w-36 shrink-0 font-semibold">{formatHebrew(hd, false)}</span>
              <span className="text-muted">
                {tzadikim.length ? tzadikim.map((t, i) => (
                  <span key={t.id}>{i > 0 && " · "}<Link className="hover:text-accent text-foreground" href={`/tzadik/${t.slug}`}>{t.name}</Link></span>
                )) : "—"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5 flex items-center justify-between gap-4 flex-wrap bg-accent-soft">
        <div>
          <div className="font-bold text-lg">בדרך לציון?</div>
          <div className="text-sm">מצאו את הקברים הקרובים אליכם ואת ההילולות של היום, ונווטו ב-Waze או Google Maps.</div>
        </div>
        <Link href="/app" className="btn btn-primary">לאפליקציית הניווט</Link>
      </section>
    </div>
  );
}
