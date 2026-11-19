import "server-only";
import postgres from "postgres";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { OLD_SAMPLE_SLUGS, SEED_VERSION, seedSites, seedTzadikim } from "@/data/seed";
import { importHillulot } from "@/lib/csv-import";

type Sql = postgres.Sql;

const g = globalThis as unknown as { __sql?: Sql; __ready?: Promise<void> };

/** חיבור ל-Postgres לפי DATABASE_URL (נקרא בזמן ריצה). null אם לא הוגדר. */
function client(): Sql | null {
  const url = process.env["DATABASE_URL"];
  if (!url) return null;
  if (!g.__sql) {
    g.__sql = postgres(url, {
      onnotice: () => {},
      max: 5,
      idle_timeout: 30,
      ssl: process.env["DATABASE_SSL"] === "true" ? "require" : false,
    });
  }
  return g.__sql;
}

async function migrate(sql: Sql) {
  const file = await readFile(path.join(process.cwd(), "db", "schema.sql"), "utf8");
  await sql.unsafe(file);
  await sql`create table if not exists app_meta (key text primary key, value text)`;
  const [meta] = await sql<{ value: string }[]>`select value from app_meta where key = 'seed_version'`;
  const version = meta ? Number(meta.value) : 1;
  const slugs = (await sql<{ slug: string }[]>`select slug from tzadikim`).map((r) => r.slug);
  // מאגר ריק, או מאגר שמכיל רק את נתוני הדוגמה הישנים ולא נערך: טוענים את רשימת ההילולות
  const untouchedSample = version < SEED_VERSION && slugs.length > 0 && slugs.every((s) => OLD_SAMPLE_SLUGS.includes(s));
  if (slugs.length === 0 || untouchedSample) {
    await sql.begin(async (tx) => {
      if (untouchedSample) {
        await tx`delete from tzadikim where slug in ${tx(OLD_SAMPLE_SLUGS)}`;
        await tx`delete from sites s where not exists (select 1 from tzadikim t where t.site_id = s.id)
          and not exists (select 1 from photos p where p.site_id = s.id)`;
      }
      const ids = new Map<string, string>();
      for (const s of seedSites) {
        const { id, ...r } = s;
        const [row] = await tx<{ id: string }[]>`insert into sites ${tx(r)} returning id`;
        ids.set(id, row.id);
      }
      for (const t of seedTzadikim) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, site_id, ...r } = t;
        await tx`insert into tzadikim ${tx({ ...r, site_id: site_id ? ids.get(site_id) ?? null : null })}`;
      }
    });
  }
  // גרסה 3: הוספת 308 צדיקים מ-Wikidata (db/import/wikidata-2026-11.csv), פעם אחת לכל מאגר.
  // הייבוא מזהה צדיק קיים לפי שם, כך שהרצה חוזרת לא יוצרת כפילויות.
  if (version < 3) {
    const csv = await readFile(path.join(process.cwd(), "db", "import", "wikidata-2026-11.csv"), "utf8");
    const res = await importHillulot(sql, csv);
    console.log(`[seed v3] wikidata import: added ${res.added}, updated ${res.updated}, sites ${res.sitesAdded}, skipped ${res.skipped.length}`);
  }
  // גרסה 4: עוד 182 רבנים פחות מוכרים מ-Wikidata (db/import/wikidata-2026-11-b.csv)
  if (version < 4) {
    const csv = await readFile(path.join(process.cwd(), "db", "import", "wikidata-2026-11-b.csv"), "utf8");
    const res = await importHillulot(sql, csv);
    console.log(`[seed v4] wikidata import: added ${res.added}, updated ${res.updated}, sites ${res.sitesAdded}, skipped ${res.skipped.length}`);
  }
  // גרסה 5: 204 רבנים נוספים שתאריך הפטירה העברי ומקום הקבורה שלהם אומתו מול ויקיפדיה העברית
  if (version < 5) {
    const csv = await readFile(path.join(process.cwd(), "db", "import", "wikidata-2026-11-c-verified.csv"), "utf8");
    const res = await importHillulot(sql, csv);
    console.log(`[seed v5] wikidata import: added ${res.added}, updated ${res.updated}, sites ${res.sitesAdded}, skipped ${res.skipped.length}`);
  }
  if (version < SEED_VERSION) {
    await sql`insert into app_meta (key, value) values ('seed_version', ${String(SEED_VERSION)})
      on conflict (key) do update set value = excluded.value`;
  }
}

/** מחזיר חיבור מוכן (אחרי יצירת הטבלאות), או null כשאין מסד נתונים מוגדר. */
export async function db(): Promise<Sql | null> {
  const sql = client();
  if (!sql) return null;
  if (!g.__ready) {
    g.__ready = migrate(sql).catch((e) => {
      g.__ready = undefined;
      throw e;
    });
  }
  await g.__ready;
  return sql;
}
