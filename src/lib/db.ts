import "server-only";
import { connection } from "next/server";
import { HDate } from "@hebcal/core";
import { publicClient } from "./supabase";
import { seedEvents, seedPhotos, seedSites, seedTzadikim } from "@/data/seed";
import { currentHebrewDate, isHillulaOn } from "./hebrew";
import type { HillulaEvent, Photo, Site, Tzadik, TzadikWithSite } from "./types";

const PHOTO_BUCKET = "photos";

async function loadAll(): Promise<{ sites: Site[]; tzadikim: Tzadik[] }> {
  await connection();
  const sb = publicClient();
  if (!sb) return { sites: seedSites, tzadikim: seedTzadikim };
  const [s, t] = await Promise.all([
    sb.from("sites").select("*"),
    sb.from("tzadikim").select("*").eq("is_published", true).order("name"),
  ]);
  if (s.error) throw s.error;
  if (t.error) throw t.error;
  return { sites: s.data as Site[], tzadikim: t.data as Tzadik[] };
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
  const today = currentHebrewDate();
  const out: { hd: HDate; tzadikim: TzadikWithSite[] }[] = [];
  let hd = today;
  for (let i = 0; i < days; i++) {
    out.push({ hd, tzadikim: hillulotOn(all, hd) });
    hd = hd.next();
  }
  return out;
}

export async function getPhotos(tzadikId: string, siteId: string | null): Promise<Photo[]> {
  await connection();
  const sb = publicClient();
  if (!sb) return seedPhotos.filter((p) => p.tzadik_id === tzadikId || (siteId && p.site_id === siteId));
  let q = sb.from("photos").select("*").order("sort");
  q = siteId ? q.or(`tzadik_id.eq.${tzadikId},site_id.eq.${siteId}`) : q.eq("tzadik_id", tzadikId);
  const { data, error } = await q;
  if (error) throw error;
  return (data as (Omit<Photo, "url"> & { storage_path: string })[]).map((p) => ({
    ...p,
    url: sb.storage.from(PHOTO_BUCKET).getPublicUrl(p.storage_path).data.publicUrl,
  }));
}

/** סעודות הילולה עתידיות (כולל מבוטלות, כדי שהעדכון יוצג). */
export async function getUpcomingEvents(opts: { tzadikId?: string; limit?: number } = {}): Promise<HillulaEvent[]> {
  await connection();
  const sb = publicClient();
  const since = new Date(Date.now() - 6 * 3600 * 1000).toISOString();
  if (!sb) {
    return seedEvents
      .filter((e) => e.starts_at >= since && (!opts.tzadikId || e.tzadik_id === opts.tzadikId))
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
      .slice(0, opts.limit ?? 100);
  }
  let q = sb.from("hillula_events").select("*").gte("starts_at", since).order("starts_at").limit(opts.limit ?? 100);
  if (opts.tzadikId) q = q.eq("tzadik_id", opts.tzadikId);
  const { data, error } = await q;
  if (error) throw error;
  return data as HillulaEvent[];
}
