import Link from "next/link";
import { getTzadikim, getUpcomingEvents, getUpcomingHillulot } from "@/lib/db";
import { formatGregorian, formatHebrew } from "@/lib/hebrew";
import TzadikCard from "@/components/TzadikCard";
import EventItem from "@/components/EventItem";
import Candle from "@/components/Candle";
import AdSlot from "@/components/AdSlot";
import SubscribeBox from "@/components/SubscribeBox";

export default async function Home() {
  const [days, events, all] = await Promise.all([getUpcomingHillulot(60), getUpcomingEvents({ limit: 6 }), getTzadikim()]);
  const [today, ...rest] = days;
  const week = rest.slice(0, 7);
  const next = rest.find((d) => d.tzadikim.length);
  const byId = new Map(all.map((t) => [t.id, t]));

  return (
    <div className="flex flex-col gap-16">
      {/* פתיח */}
      <section className="full-bleed night-sky -mt-8">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 grid md:grid-cols-[1fr_auto] gap-10 items-center">
          <div className="fade-up">
            <div className="text-gold-soft/80 text-sm tracking-wide mb-3">היום · {formatGregorian(today.hd.greg())}</div>
            <h1 className="font-display text-5xl md:text-7xl font-black gold-text leading-tight">{formatHebrew(today.hd)}</h1>
            <p className="mt-5 text-lg md:text-xl text-white/80 max-w-xl leading-8">
              ציוני הצדיקים במקום אחד: דרכי הגעה, תולדות חייהם, תמונות, הילולות יומיות ועדכוני סעודות הילולה.
            </p>
            <form action="/tzadikim" className="mt-8 flex gap-2 max-w-lg">
              <input name="q" placeholder="חפשו צדיק, מקום או עיר…" className="input !rounded-full !bg-white/95 !text-night !border-transparent text-lg" />
              <button className="btn btn-primary !px-6">חיפוש</button>
            </form>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Link href="/app" className="btn btn-ghost-light">🧭 ציונים קרובים אליי</Link>
              <Link href="/hillulot" className="btn btn-ghost-light">📅 לוח הילולות</Link>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center gap-3">
            <Candle className="w-28 h-44" />
            <div className="text-gold-soft/80 text-sm">
              {today.tzadikim.length ? `${today.tzadikim.length} הילולות היום` : "נר לנשמת הצדיקים"}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1fr_300px] items-start">
      <div className="flex flex-col gap-16 min-w-0">
      {/* הילולות היום */}
      <section>
        <div className="ornament mb-2"><span className="text-sm font-semibold">✦</span></div>
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-8">הילולות היום</h2>
        {today.tzadikim.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {today.tzadikim.map((t) => <TzadikCard key={t.id} t={t} highlight />)}
          </div>
        ) : (
          <div className="card p-8 text-center flex flex-col items-center gap-4">
            <p className="text-muted text-lg">אין במאגר הילולות שחלות היום.</p>
            {next && (
              <>
                <div className="text-sm text-muted">ההילולה הקרובה: <b className="text-foreground">{formatHebrew(next.hd, false)}</b> · {formatGregorian(next.hd.greg())}</div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 w-full text-right">
                  {next.tzadikim.map((t) => <TzadikCard key={t.id} t={t} />)}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* השבוע הקרוב */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl md:text-3xl font-bold">השבוע הקרוב</h2>
          <Link href="/hillulot" className="text-accent font-semibold text-sm hover:underline">ללוח המלא ←</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
          {week.map(({ hd, tzadikim }) => (
            <div key={hd.toString()} className={`card p-3 flex flex-col gap-1 min-h-28 ${tzadikim.length ? "border-gold/60" : ""}`}>
              <div className="font-display text-lg font-bold">{formatHebrew(hd, false)}</div>
              <div className="text-xs text-muted">{formatGregorian(hd.greg())}</div>
              <div className="mt-1 flex flex-col gap-0.5 text-sm">
                {tzadikim.length ? tzadikim.map((t) => (
                  <Link key={t.id} href={`/tzadik/${t.slug}`} className="text-accent-strong hover:underline leading-5">🕯️ {t.name}</Link>
                )) : <span className="text-muted/60">—</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      </div>
      <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
        <AdSlot />
        <SubscribeBox />
      </aside>
      </div>

      {/* סעודות */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl md:text-3xl font-bold">סעודות הילולה קרובות</h2>
          <Link href="/seudot" className="text-accent font-semibold text-sm hover:underline">לכל הסעודות ←</Link>
        </div>
        {events.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => <EventItem key={e.id} e={e} tzadik={e.tzadik_id ? byId.get(e.tzadik_id) : null} />)}
          </ul>
        ) : <p className="card p-6 text-muted text-center">אין כרגע סעודות מתוכננות. עדכונים יופיעו כאן.</p>}
      </section>

      {/* אפליקציה */}
      <section className="full-bleed night-sky -mb-16">
        <div className="mx-auto max-w-6xl px-4 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold gold-text mb-4">בדרך לציון?</h2>
            <p className="text-white/80 text-lg leading-8 mb-6">
              האפליקציה מציגה קודם את ההילולות של היום הקרובות אליכם, ואחריהן את כל הציונים לפי מרחק. לחיצה אחת ואתם בדרך עם Waze או Google Maps.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/app" className="btn btn-primary">לאפליקציית הניווט</Link>
            </div>
            <p className="text-white/60 text-sm mt-4">טיפ: בטלפון פתחו את האפליקציה ובחרו &quot;הוספה למסך הבית&quot;.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { n: all.length, l: "צדיקים במאגר" },
              { n: days.reduce((s, d) => s + d.tzadikim.length, 0), l: "הילולות בחודשיים" },
              { n: events.length, l: "סעודות קרובות" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <div className="font-display text-4xl font-black gold-text">{s.n}</div>
                <div className="text-white/70 text-sm mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
