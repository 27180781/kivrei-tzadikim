import type { Metadata } from "next";
import { getTzadikim, getUpcomingEvents } from "@/lib/db";
import EventItem from "@/components/EventItem";

export const metadata: Metadata = { title: "סעודות הילולה" };

export default async function SeudotPage() {
  const [events, all] = await Promise.all([getUpcomingEvents(), getTzadikim()]);
  const byId = new Map(all.map((t) => [t.id, t]));
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">סעודות הילולה</h1>
      {events.length ? <ul className="grid gap-3 sm:grid-cols-2">{events.map((e) => <EventItem key={e.id} e={e} tzadik={e.tzadik_id ? byId.get(e.tzadik_id) : null} />)}</ul>
        : <p className="card p-4 text-muted">אין כרגע סעודות מתוכננות.</p>}
    </div>
  );
}
