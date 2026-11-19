import "server-only";
import postgres from "postgres";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { seedSites, seedTzadikim } from "@/data/seed";

type Sql = postgres.Sql;

const g = globalThis as unknown as { __sql?: Sql; __ready?: Promise<void> };

/** חיבור ל-Postgres לפי DATABASE_URL (נקרא בזמן ריצה). null אם לא הוגדר. */
function client(): Sql | null {
  const url = process.env["DATABASE_URL"];
  if (!url) return null;
  if (!g.__sql) {
    g.__sql = postgres(url, {
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
  const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from tzadikim`;
  if (count === 0) {
    // מאגר ריק: טוענים את נתוני הדוגמה כנקודת התחלה (לעריכה בממשק הניהול)
    await sql.begin(async (tx) => {
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
