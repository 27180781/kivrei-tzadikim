import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPhotos, getTzadikBySlug, getUpcomingEvents } from "@/lib/db";
import { currentHebrewDate, hebrewDayMonthLabel, isHillulaOn } from "@/lib/hebrew";
import NavButtons from "@/components/NavButtons";
import EventItem from "@/components/EventItem";

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

  return (
    <article className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold">{t.name}</h1>
        {t.aka?.length ? <div className="text-muted">{t.aka.join(" · ")}</div> : null}
        <div className="flex gap-2 mt-2 flex-wrap text-sm">
          {t.hebrew_death_month && t.hebrew_death_day ? (
            <span className="bg-accent-soft text-accent rounded-full px-3 py-1">
              יום ההילולה: {hebrewDayMonthLabel(t.hebrew_death_month, t.hebrew_death_day)}
            </span>
          ) : null}
          {today && <span className="bg-accent text-white rounded-full px-3 py-1">ההילולה היום!</span>}
          {t.ivr_code ? <span className="border border-border rounded-full px-3 py-1">מספר בקו הטלפוני: {t.ivr_code}</span> : null}
        </div>
      </header>

      {photos.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.id} src={p.url} alt={p.caption ?? t.name} className="h-56 rounded-xl object-cover" />
          ))}
        </div>
      )}

      {t.bio && (
        <section className="card p-5">
          <h2 className="font-bold text-lg mb-2">אודות</h2>
          <p className="whitespace-pre-line leading-7">{t.bio}</p>
        </section>
      )}

      {s && (
        <section className="card p-5 flex flex-col gap-2">
          <h2 className="font-bold text-lg">מקום הציון ודרכי הגעה</h2>
          <div>📍 {s.name}{s.address ? `, ${s.address}` : ""}</div>
          {s.directions && <p className="whitespace-pre-line"><b>ברכב: </b>{s.directions}</p>}
          {s.public_transport && <p className="whitespace-pre-line"><b>תחבורה ציבורית: </b>{s.public_transport}</p>}
          {s.opening_hours && <p><b>שעות פתיחה: </b>{s.opening_hours}</p>}
          {s.accessibility && <p><b>נגישות: </b>{s.accessibility}</p>}
          {s.notes && <p className="text-muted whitespace-pre-line">{s.notes}</p>}
          {s.lat && s.lng ? <NavButtons lat={s.lat} lng={s.lng} /> : null}
        </section>
      )}

      <section>
        <h2 className="font-bold text-lg mb-3">סעודות הילולה</h2>
        {events.length ? <ul className="grid gap-3">{events.map((e) => <EventItem key={e.id} e={e} tzadik={t} />)}</ul>
          : <p className="text-muted">אין כרגע סעודות מתוכננות.</p>}
      </section>
    </article>
  );
}
