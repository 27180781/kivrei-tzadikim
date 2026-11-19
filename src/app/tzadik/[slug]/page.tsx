import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPhotos, getTzadikBySlug, getUpcomingEvents } from "@/lib/db";
import { currentHebrewDate, hebrewDayMonthLabel, isHillulaOn } from "@/lib/hebrew";
import { googleMapsUrl, wazeUrl } from "@/lib/nav";
import EventItem from "@/components/EventItem";
import AdSlot from "@/components/AdSlot";
import Candle from "@/components/Candle";

export async function generateMetadata({ params }: PageProps<"/tzadik/[slug]">): Promise<Metadata> {
  const t = await getTzadikBySlug((await params).slug);
  return { title: t?.name ?? "לא נמצא", description: t?.bio_short ?? undefined };
}

export default async function TzadikPage({ params }: PageProps<"/tzadik/[slug]">) {
  const t = await getTzadikBySlug((await params).slug);
  if (!t) notFound();
  const [photos, events] = await Promise.all([getPhotos(t.id, t.site_id), getUpcomingEvents({ tzadikId: t.id })]);
  const today = isHillulaOn(t.hebrew_death_month, t.hebrew_death_day, currentHebrewDate());
  const s = t.site;
  const cover = photos[0];

  return (
    <article className="flex flex-col gap-10">
      <header className="full-bleed night-sky -mt-8 relative overflow-hidden">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.url} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30" />
        )}
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20 flex items-end justify-between gap-6">
          <div className="fade-up">
            <Link href="/tzadikim" className="text-gold-soft/80 text-sm hover:text-gold">→ כל הצדיקים</Link>
            <h1 className="font-display text-4xl md:text-6xl font-black gold-text mt-3 leading-tight">{t.name}</h1>
            {t.aka?.length ? <div className="text-white/75 text-lg mt-1">{t.aka.join(" · ")}</div> : null}
            <div className="flex gap-2 mt-5 flex-wrap text-sm">
              {t.hebrew_death_month && t.hebrew_death_day ? (
                <span className="chip !bg-white/10 !text-gold-soft border border-white/15">
                  יום ההילולה: {hebrewDayMonthLabel(t.hebrew_death_month, t.hebrew_death_day)}
                </span>
              ) : null}
              {today && <span className="chip !bg-gold !text-night">🕯️ ההילולה היום!</span>}
              {t.ivr_code ? <span className="chip !bg-white/10 !text-white/85 border border-white/15">☎ מספר בקו הטלפוני: {t.ivr_code}</span> : null}
            </div>
            {s?.lat && s?.lng ? (
              <div className="flex gap-3 mt-6 flex-wrap">
                <a className="btn btn-primary" href={wazeUrl(s.lat, s.lng)} target="_blank" rel="noopener">ניווט ב-Waze</a>
                <a className="btn btn-ghost-light" href={googleMapsUrl(s.lat, s.lng)} target="_blank" rel="noopener">Google Maps</a>
              </div>
            ) : null}
          </div>
          <Candle className="hidden md:block w-20 h-32 shrink-0" />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-8 min-w-0">
          {photos.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.id} src={p.url} alt={p.caption ?? t.name} className="h-60 rounded-2xl object-cover snap-start shadow-md" />
              ))}
            </div>
          )}
          {t.bio && (
            <section className="card p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">אודות</h2>
              <p className="whitespace-pre-line leading-8 text-[17px]">{t.bio}</p>
            </section>
          )}
          <section>
            <h2 className="text-2xl font-bold mb-4">סעודות הילולה</h2>
            {events.length ? <ul className="grid gap-3">{events.map((e) => <EventItem key={e.id} e={e} tzadik={t} />)}</ul>
              : <p className="card p-5 text-muted">אין כרגע סעודות מתוכננות.</p>}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          {s && (
            <section className="card p-6 flex flex-col gap-3 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold">מקום הציון ודרכי הגעה</h2>
              <div className="font-semibold">📍 {s.name}{s.address ? `, ${s.address}` : ""}</div>
              {s.directions && <p className="text-sm leading-6 whitespace-pre-line"><b>ברכב: </b>{s.directions}</p>}
              {s.public_transport && <p className="text-sm leading-6 whitespace-pre-line"><b>תחבורה ציבורית: </b>{s.public_transport}</p>}
              {s.opening_hours && <p className="text-sm"><b>שעות פתיחה: </b>{s.opening_hours}</p>}
              {s.accessibility && <p className="text-sm"><b>נגישות: </b>{s.accessibility}</p>}
              {s.notes && <p className="text-sm text-muted whitespace-pre-line">{s.notes}</p>}
              {s.lat && s.lng ? (
                <div className="flex gap-2 pt-1">
                  <a className="btn btn-primary flex-1" href={wazeUrl(s.lat, s.lng)} target="_blank" rel="noopener">Waze</a>
                  <a className="btn flex-1" href={googleMapsUrl(s.lat, s.lng)} target="_blank" rel="noopener">Google Maps</a>
                </div>
              ) : null}
            </section>
          )}
          <AdSlot />
        </aside>
      </div>
    </article>
  );
}
