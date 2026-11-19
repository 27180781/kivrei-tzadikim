import type { Metadata } from "next";
import { getTzadikim, getUpcomingEvents } from "@/lib/db";
import EventItem from "@/components/EventItem";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "סעודות הילולה" };

export default async function SeudotPage() {
  const [events, all] = await Promise.all([getUpcomingEvents(), getTzadikim()]);
  const byId = new Map(all.map((t) => [t.id, t]));
  return (
    <div>
      <PageHeader title="סעודות הילולה" subtitle="מועדים, מקומות ועדכונים על סעודות הילולה בציוני הצדיקים." />
      {events.length ? <ul className="grid gap-4 sm:grid-cols-2">{events.map((e) => <EventItem key={e.id} e={e} tzadik={e.tzadik_id ? byId.get(e.tzadik_id) : null} />)}</ul>
        : <p className="card p-8 text-muted text-center">אין כרגע סעודות מתוכננות. עדכונים יופיעו כאן.</p>}
    </div>
  );
}
