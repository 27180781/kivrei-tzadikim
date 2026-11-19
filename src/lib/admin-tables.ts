import { ENTITIES, type Entity } from "@/components/admin/config";

export function entityFor(table: string): Entity | null {
  return ENTITIES.find((e) => e.table === table) ?? null;
}

/** משאיר רק עמודות מותרות לפי הגדרות הטופס, וממיר ערכים ריקים ל-null. */
export function cleanRow(entity: Entity, body: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  for (const f of entity.fields) {
    if (!(f.key in body)) continue;
    let v = body[f.key];
    if (v === "" || v === undefined) v = null;
    if (f.type === "number" && v != null) v = Number(v);
    if (f.type === "bool") v = Boolean(v);
    if (f.type === "list" && v != null && !Array.isArray(v)) v = String(v).split(",").map((s) => s.trim()).filter(Boolean);
    row[f.key] = v;
  }
  if (entity.table === "hillula_events") row.updated_at = new Date();
  return row;
}

export function dbError(e: unknown) {
  const err = e as { code?: string; message?: string };
  const msg =
    err.code === "23505" ? "ערך כפול: הכתובת בדף או המספר בקו הטלפוני כבר קיימים" :
    err.code === "23502" ? "חסר שדה חובה" :
    err.code === "23514" ? "ערך לא תקין (למשל יום ההילולה צריך להיות בין 1 ל-30)" :
    err.message ?? "שגיאה";
  return Response.json({ error: msg }, { status: 400 });
}
