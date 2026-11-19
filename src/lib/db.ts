import "server-only";
import { connection } from "next/server";
import { HDate } from "@hebcal/core";
import { db } from "./pg";
import { seedEvents, seedPhotos, seedSites, seedTzadikim } from "@/data/seed";
import { currentHebrewDate, isHillulaOn } from "./hebrew";
import type { HillulaEvent, Photo, Site, Tzadik, TzadikWithSite } from "./types";

async function loadAll(): Promise<{ sites: Site[]; tzadikim: Tzadik[] }> {
  await connection();
  const sql = await db();
  if (!sql) return { sites: seedSites, tzadikim: seedTzadikim };
  const [sites, tzadikim] = await Promise.all([
    sql<Site[]>`select id, name, city, address, lat, lng, directions, public_transport, opening_hours, accessibility, notes from sites`,
    sql<Tzadik[]>`select id, ivr_code, name, aka, slug, bio, bio_short, hebrew_death_day, hebrew_death_month, death_year_hebrew, site_id, is_published
                  from tzadikim where is_published`,
  ]);
  return { sites: [...sites], tzadikim: [...tzadikim] };
}

export async function getTzadikim(): Promise<TzadikWithSite[]> {
  const { sites, tzadikim } = await loadAll();
  const byId = new Map(sites.map((s) => [s.id, s]));
  return tzadikim
    .map((t) => ({ ...t, site: t.site_id ? byId.get(t.site_id) ?? null : null }))
    .sort((a, b) => a.name.localeCompare(b.name, "he"));
}

export async function getTzadikBySlug(slug: string): Promise<TzadikWithSite | null> {
  const all = await getTzadikim();
  return all.find((t) => t.slug === decodeURIComponent(slug)) ?? null;
}

export async function getTzadikByCode(code: number): Promise<TzadikWithSite | null> {
  const all = await getTzadikim();
  return all.find((t) => t.ivr_code === code) ?? null;
}

export function hillulotOn(all: TzadikWithSite[], hd: HDate): TzadikWithSite[] {
  return all.filter((t) => isHillulaOn(t.hebrew_death_month, t.hebrew_death_day, hd));
}

/** הילולות ב-N הימים העבריים הבאים (כולל היום), לפי שעון ושקיעה של ארץ ישראל. */
export async function getUpcomingHillulot(days: number) {
  const all = await getTzadikim();
  const out: { hd: HDate; tzadikim: TzadikWithSite[] }[] = [];
  let hd = currentHebrewDate();
  for (let i = 0; i < days; i++) {
    out.push({ hd, tzadikim: hillulotOn(all, hd) });
    hd = hd.next();
  }
  return out;
}

export async function getPhotos(tzadikId: string, siteId: string | null): Promise<Photo[]> {
  await connection();
  const sql = await db();
  if (!sql) return seedPhotos.filter((p) => p.tzadik_id === tzadikId || (siteId && p.site_id === siteId));
  const rows = await sql<Omit<Photo, "url">[]>`
    select id, tzadik_id, site_id, caption, sort from photos
    where tzadik_id = ${tzadikId} or (${siteId}::uuid is not null and site_id = ${siteId}::uuid)
    order by sort, created_at`;
  return rows.map((p) => ({ ...p, url: `/api/photos/${p.id}` }));
}

/** סעודות הילולה עתידיות (כולל מבוטלות, כדי שהעדכון יוצג). */
export async function getUpcomingEvents(opts: { tzadikId?: string; limit?: number } = {}): Promise<HillulaEvent[]> {
  await connection();
  const sql = await db();
  const since = new Date(Date.now() - 6 * 3600 * 1000);
  const limit = opts.limit ?? 100;
  if (!sql) {
    return seedEvents
      .filter((e) => new Date(e.starts_at) >= since && (!opts.tzadikId || e.tzadik_id === opts.tzadikId))
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
      .slice(0, limit);
  }
  const rows = await sql<(Omit<HillulaEvent, "starts_at" | "updated_at"> & { starts_at: Date; updated_at: Date })[]>`
    select * from hillula_events
    where starts_at >= ${since} ${opts.tzadikId ? sql`and tzadik_id = ${opts.tzadikId}` : sql``}
    order by starts_at limit ${limit}`;
  return rows.map((r) => ({ ...r, starts_at: r.starts_at.toISOString(), updated_at: r.updated_at.toISOString() }));
}
