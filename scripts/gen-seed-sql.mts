// מייצר supabase/seed.sql מנתוני הדוגמה: node --experimental-strip-types scripts/gen-seed-sql.mts
import { writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { seedSites, seedTzadikim } from "../src/data/seed.ts";

const q = (v: unknown): string =>
  v == null ? "null" : Array.isArray(v) ? `array[${v.map(q).join(",")}]::text[]` : typeof v === "number" || typeof v === "boolean" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const ids = new Map(seedSites.map((s) => [s.id, randomUUID()]));
let sql = "-- נתוני דוגמה (לאימות לפני עלייה לאוויר)\n";
for (const s of seedSites) {
  const { id, ...r } = s;
  sql += `insert into sites (id, ${Object.keys(r).join(", ")}) values ('${ids.get(id)}', ${Object.values(r).map(q).join(", ")});\n`;
}
for (const t of seedTzadikim) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, site_id, ...r } = t;
  sql += `insert into tzadikim (site_id, ${Object.keys(r).join(", ")}) values (${site_id ? `'${ids.get(site_id)}'` : "null"}, ${Object.values(r).map(q).join(", ")});\n`;
}
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log("wrote supabase/seed.sql");
