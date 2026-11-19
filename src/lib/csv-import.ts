import "server-only";
import type postgres from "postgres";

/** פענוח CSV פשוט (תומך במרכאות כפולות ובמרכאות מוכפלות בתוך שדה) */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  const [head, ...body] = rows;
  if (!head) return [];
  const keys = head.map((h) => h.trim());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

const MONTHS: Record<string, number> = {
  "ניסן": 1, "אייר": 2, "סיוון": 3, "סיון": 3, "תמוז": 4, "אב": 5, "מנחם אב": 5, "אלול": 6, "תשרי": 7,
  "חשוון": 8, "חשון": 8, "מרחשוון": 8, "כסלו": 9, "כסליו": 9, "טבת": 10, "שבט": 11, "אדר": 12, "אדר א": 12, "אדר ב": 13,
};

export type ImportResult = { added: number; updated: number; sitesAdded: number; skipped: string[] };

/**
 * ייבוא רשימת הילולות בפורמט: month, day, name, title, location, country, lat, lng
 * צדיק מזוהה לפי שם (קיים: מתעדכן; חדש: נוסף). מקום ציון מזוהה לפי מיקום או שם, ומקומות זהים מאוחדים.
 */
export async function importHillulot(sql: postgres.Sql, csv: string): Promise<ImportResult> {
  const rows = parseCsv(csv);
  const res: ImportResult = { added: 0, updated: 0, sitesAdded: 0, skipped: [] };
  await sql.begin(async (tx) => {
    const sites = await tx<{ id: string; name: string; lat: number | null; lng: number | null }[]>`select id, name, lat, lng from sites`;
    let [{ max }] = await tx<{ max: number }[]>`select coalesce(max(ivr_code), 0)::int as max from tzadikim`;
    for (const r of rows) {
      const name = r.name;
      const month = MONTHS[(r.month ?? "").replace(/[׳']/g, "").trim()];
      const day = Number(r.day);
      if (!name || !month || !(day >= 1 && day <= 30) || /יום הולדת/.test(name)) {
        res.skipped.push(name || "(שורה ריקה)");
        continue;
      }
      // מקום הציון
      let siteId: string | null = null;
      const loc = r.location ?? "";
      const lat = r.lat ? Number(r.lat) : null, lng = r.lng ? Number(r.lng) : null;
      if (loc && !/לא נודע/.test(loc)) {
        const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
        if (parts.length > 1 && parts[parts.length - 1] === r.country) parts.pop();
        let siteName = parts.join(", ");
        if (parts.length === 1 && !siteName.includes("/")) {
          // רק שם עיר: שם המקום יהיה "ציון <הצדיק>, <עיר>"
          const short = name.match(/\(([^)]+)\)/)?.[1] ?? name;
          siteName = `ציון ${short}, ${siteName}`;
        }
        const found = sites.find((s) =>
          (lat != null && lng != null && s.lat != null && s.lng != null && Math.abs(s.lat - lat) < 0.0005 && Math.abs(s.lng - lng) < 0.0005) ||
          s.name === siteName);
        if (found) siteId = found.id;
        else {
          const address = !r.country || r.country === "ישראל" ? siteName : `${siteName}, ${r.country}`;
          const [row] = await tx<{ id: string }[]>`insert into sites ${tx({ name: siteName, city: parts[parts.length - 1], address, lat, lng })} returning id`;
          sites.push({ id: row.id, name: siteName, lat, lng });
          siteId = row.id;
          res.sitesAdded++;
        }
      }
      const fields = { hebrew_death_month: month, hebrew_death_day: day, site_id: siteId, bio_short: r.title || null };
      // זיהוי: אותו שם ואותו תאריך; אחרת שם יחיד במאגר (תיקון תאריך). שני צדיקים בשם זהה ובתאריכים שונים נשארים נפרדים
      const same = await tx<{ id: string; m: number | null; d: number | null }[]>`
        select id, hebrew_death_month as m, hebrew_death_day as d from tzadikim
        where name = ${name} or name like ${name.replace(/[%_\\]/g, "\\$&") + " (%"}`;
      const existing = same.find((t) => t.m === month && t.d === day) ?? (same.length === 1 ? same[0] : undefined);
      if (existing) {
        await tx`update tzadikim set ${tx(fields)} where id = ${existing.id}`;
        res.updated++;
      } else {
        max++;
        await tx`insert into tzadikim ${tx({ ...fields, name, slug: `tzadik-${max}`, ivr_code: max, is_published: true })}`;
        res.added++;
      }
    }
  });
  return res;
}
