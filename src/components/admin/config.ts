import { HEBREW_MONTHS } from "@/lib/hebrew";

export type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "datetime" | "bool" | "list" | "ref";
  options?: { value: string | number; label: string }[];
  ref?: "sites" | "tzadikim";
  required?: boolean;
};

export type Entity = {
  table: "tzadikim" | "sites" | "hillula_events";
  label: string;
  title: (row: Record<string, unknown>) => string;
  order: string;
  fields: Field[];
};

export const ENTITIES: Entity[] = [
  {
    table: "tzadikim",
    label: "צדיקים",
    order: "name",
    title: (r) => String(r.name ?? ""),
    fields: [
      { key: "name", label: "שם", type: "text", required: true },
      { key: "slug", label: "כתובת בדף (באנגלית, למשל rashbi)", type: "text", required: true },
      { key: "aka", label: "כינויים (מופרדים בפסיק)", type: "list" },
      { key: "ivr_code", label: "מספר בקו הטלפוני", type: "number" },
      { key: "hebrew_death_day", label: "יום ההילולה (1 עד 30)", type: "number" },
      { key: "hebrew_death_month", label: "חודש ההילולה", type: "select", options: HEBREW_MONTHS },
      { key: "site_id", label: "מקום הציון", type: "ref", ref: "sites" },
      { key: "bio_short", label: "תקציר (מוקרא גם בטלפון)", type: "textarea" },
      { key: "bio", label: "אודות", type: "textarea" },
      { key: "is_published", label: "מפורסם באתר", type: "bool" },
    ],
  },
  {
    table: "sites",
    label: "מקומות ציון",
    order: "name",
    title: (r) => String(r.name ?? ""),
    fields: [
      { key: "name", label: "שם המקום", type: "text", required: true },
      { key: "city", label: "עיר / יישוב", type: "text" },
      { key: "address", label: "כתובת", type: "text" },
      { key: "lat", label: "קו רוחב (lat)", type: "number" },
      { key: "lng", label: "קו אורך (lng)", type: "number" },
      { key: "directions", label: "דרכי הגעה ברכב", type: "textarea" },
      { key: "public_transport", label: "תחבורה ציבורית", type: "textarea" },
      { key: "opening_hours", label: "שעות פתיחה", type: "text" },
      { key: "accessibility", label: "נגישות", type: "text" },
      { key: "notes", label: "הערות", type: "textarea" },
    ],
  },
  {
    table: "hillula_events",
    label: "סעודות הילולה",
    order: "starts_at",
    title: (r) => `${r.starts_at ? new Date(String(r.starts_at)).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" }) : ""} ${r.organizer ?? ""}`,
    fields: [
      { key: "tzadik_id", label: "צדיק", type: "ref", ref: "tzadikim", required: true },
      { key: "starts_at", label: "מועד (שעון ישראל)", type: "datetime", required: true },
      { key: "location_text", label: "מקום (אם שונה מהציון)", type: "text" },
      { key: "organizer", label: "מארגן", type: "text" },
      { key: "contact_phone", label: "טלפון ליצירת קשר", type: "text" },
      { key: "details", label: "פרטים", type: "textarea" },
      { key: "status", label: "סטטוס", type: "select", options: [
        { value: "scheduled", label: "מתוכננת" },
        { value: "updated", label: "עודכנה" },
        { value: "cancelled", label: "בוטלה" },
      ] },
    ],
  },
];
