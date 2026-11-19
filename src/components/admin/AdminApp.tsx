"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { browserClient } from "@/lib/supabase-browser";
import { ENTITIES, type Entity, type Field } from "./config";
import PhotoManager from "./PhotoManager";

type Row = Record<string, unknown> & { id?: string };

export default function AdminApp({ config }: { config: { url: string; anonKey: string } | null }) {
  const sb = useMemo(() => browserClient(config), [config]);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  if (!sb) return <p className="card p-4">ממשק הניהול דורש חיבור ל-Supabase. הגדירו את משתני הסביבה (ראו README).</p>;
  if (!session) return <Login sb={sb} />;
  return <Dashboard sb={sb} onLogout={() => sb.auth.signOut()} email={session.user.email ?? ""} />;
}

function Login({ sb }: { sb: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      className="card p-6 max-w-sm mx-auto flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const { error } = await sb.auth.signInWithPassword({ email, password });
        setMsg(error ? "שם משתמש או סיסמה שגויים" : null);
      }}
    >
      <h1 className="text-xl font-bold">כניסה לניהול</h1>
      <input className="input" type="email" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
      <input className="input" type="password" placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
      <button className="btn btn-primary justify-center">כניסה</button>
      {msg && <p className="text-sm text-red-700">{msg}</p>}
    </form>
  );
}

function Dashboard({ sb, onLogout, email }: { sb: SupabaseClient; onLogout: () => void; email: string }) {
  const [tab, setTab] = useState<Entity>(ENTITIES[0]);
  const [refs, setRefs] = useState<{ sites: Row[]; tzadikim: Row[] }>({ sites: [], tzadikim: [] });
  const [subs, setSubs] = useState<number | null>(null);

  const fetchRefs = useCallback(async () => {
    const [s, t, c] = await Promise.all([
      sb.from("sites").select("id,name").order("name"),
      sb.from("tzadikim").select("id,name").order("name"),
      sb.from("ivr_subscribers").select("phone", { count: "exact", head: true }).eq("active", true),
    ]);
    return { refs: { sites: s.data ?? [], tzadikim: t.data ?? [] }, subs: c.count ?? null };
  }, [sb]);
  const apply = useCallback((r: { refs: { sites: Row[]; tzadikim: Row[] }; subs: number | null }) => {
    setRefs(r.refs);
    setSubs(r.subs);
  }, []);
  const loadRefs = useCallback(() => fetchRefs().then(apply), [fetchRefs, apply]);
  useEffect(() => { fetchRefs().then(apply); }, [fetchRefs, apply]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {ENTITIES.map((e) => (
            <button key={e.table} className={`btn ${tab.table === e.table ? "btn-primary" : ""}`} onClick={() => setTab(e)}>{e.label}</button>
          ))}
        </div>
        <div className="text-sm text-muted flex gap-3 items-center">
          {subs != null && <span>נרשמים לעדכון טלפוני: {subs}</span>}
          <span dir="ltr">{email}</span>
          <button className="btn" onClick={onLogout}>יציאה</button>
        </div>
      </div>
      <EntityEditor key={tab.table} sb={sb} entity={tab} refs={refs} onChange={loadRefs} />
    </div>
  );
}

function EntityEditor({ sb, entity, refs, onChange }: {
  sb: SupabaseClient; entity: Entity; refs: { sites: Row[]; tzadikim: Row[] }; onChange: () => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    const { data, error } = await sb.from(entity.table).select("*").order(entity.order, { ascending: entity.table !== "hillula_events" });
    return { rows: (data ?? []) as Row[], error: error?.message ?? null };
  }, [sb, entity]);
  const applyRows = useCallback((r: { rows: Row[]; error: string | null }) => {
    setRows(r.rows);
    if (r.error) setError(r.error);
  }, []);
  const load = useCallback(() => fetchRows().then(applyRows), [fetchRows, applyRows]);
  useEffect(() => { fetchRows().then(applyRows); }, [fetchRows, applyRows]);

  async function save(row: Row) {
    setError(null);
    const { id, ...rest } = row;
    if (entity.table === "hillula_events") rest.updated_at = new Date().toISOString();
    const res = id ? await sb.from(entity.table).update(rest).eq("id", id).select().single()
      : await sb.from(entity.table).insert(rest).select().single();
    if (res.error) { setError(res.error.message); return; }
    setEditing(res.data);
    await load();
    onChange();
  }

  async function remove(row: Row) {
    if (!row.id || !window.confirm("למחוק?")) return;
    const { error } = await sb.from(entity.table).delete().eq("id", row.id);
    if (error) { setError(error.message); return; }
    setEditing(null);
    await load();
    onChange();
  }

  const shown = rows.filter((r) => !filter || entity.title(r).includes(filter));

  return (
    <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
      <div className="card p-3 flex flex-col gap-2 max-h-[70vh] overflow-auto">
        <button className="btn btn-primary justify-center" onClick={() => setEditing({})}>+ הוספה</button>
        <input className="input" placeholder="סינון" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <ul className="flex flex-col">
          {shown.map((r) => (
            <li key={String(r.id)}>
              <button className={`w-full text-right px-2 py-1.5 rounded-lg hover:bg-accent-soft ${editing?.id === r.id ? "bg-accent-soft" : ""}`} onClick={() => setEditing(r)}>
                {entity.title(r) || "(ללא שם)"}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        {error && <p className="card p-3 mb-3 text-red-700 text-sm">{error}</p>}
        {editing ? (
          <RowForm key={String(editing.id ?? "new")} entity={entity} row={editing} refs={refs} onSave={save} onDelete={remove}>
            {entity.table === "tzadikim" && editing.id ? <PhotoManager sb={sb} tzadikId={String(editing.id)} /> : null}
          </RowForm>
        ) : <p className="text-muted">בחרו פריט מהרשימה או הוסיפו חדש.</p>}
      </div>
    </div>
  );
}

function toLocalInput(v: unknown): string {
  if (!v) return "";
  const d = new Date(String(v));
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jerusalem", dateStyle: "short", timeStyle: "short" }).format(d);
  return parts.replace(" ", "T");
}

/** "2026-11-20T19:30" בשעון ישראל → ISO */
function fromLocalInput(s: string): string | null {
  if (!s) return null;
  const guess = new Date(s + "Z");
  const offsetMin = (new Date(guess.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })).getTime() -
    new Date(guess.toLocaleString("en-US", { timeZone: "UTC" })).getTime()) / 60000;
  return new Date(guess.getTime() - offsetMin * 60000).toISOString();
}

function RowForm({ entity, row, refs, onSave, onDelete, children }: {
  entity: Entity; row: Row; refs: { sites: Row[]; tzadikim: Row[] };
  onSave: (r: Row) => void; onDelete: (r: Row) => void; children?: React.ReactNode;
}) {
  const [draft, setDraft] = useState<Row>(() => ({ ...(entity.table === "tzadikim" && !row.id ? { is_published: true } : {}), ...row }));
  const set = (k: string, v: unknown) => setDraft((d) => ({ ...d, [k]: v }));

  const input = (f: Field) => {
    const v = draft[f.key];
    switch (f.type) {
      case "textarea":
        return <textarea className="input min-h-28" value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value || null)} />;
      case "number":
        return <input className="input" type="number" step="any" dir="ltr" value={v == null ? "" : String(v)} onChange={(e) => set(f.key, e.target.value === "" ? null : Number(e.target.value))} />;
      case "bool":
        return <input type="checkbox" className="size-5" checked={Boolean(v)} onChange={(e) => set(f.key, e.target.checked)} />;
      case "list":
        return <input className="input" value={Array.isArray(v) ? v.join(", ") : ""} onChange={(e) => set(f.key, e.target.value ? e.target.value.split(",").map((s) => s.trim()).filter(Boolean) : null)} />;
      case "datetime":
        return <input className="input" type="datetime-local" dir="ltr" value={toLocalInput(v)} onChange={(e) => set(f.key, fromLocalInput(e.target.value))} />;
      case "select":
        return (
          <select className="input" value={v == null ? "" : String(v)} onChange={(e) => {
            const opt = f.options!.find((o) => String(o.value) === e.target.value);
            set(f.key, opt ? opt.value : null);
          }}>
            <option value="">—</option>
            {f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case "ref":
        return (
          <select className="input" value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value || null)}>
            <option value="">—</option>
            {refs[f.ref!].map((r) => <option key={String(r.id)} value={String(r.id)}>{String(r.name)}</option>)}
          </select>
        );
      default:
        return <input className="input" value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value || null)} />;
    }
  };

  return (
    <form className="card p-5 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); onSave(draft); }}>
      <h2 className="font-bold text-lg">{row.id ? `עריכה: ${entity.title(row)}` : `הוספה: ${entity.label}`}</h2>
      {entity.fields.map((f) => (
        <label key={f.key} className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">{f.label}{f.required ? " *" : ""}</span>
          {input(f)}
        </label>
      ))}
      <div className="flex gap-2">
        <button className="btn btn-primary">שמירה</button>
        {row.id ? <button type="button" className="btn text-red-700" onClick={() => onDelete(row)}>מחיקה</button> : null}
      </div>
      {children}
    </form>
  );
}
