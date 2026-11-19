"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ENTITIES, type Entity, type Field } from "./config";
import PhotoManager from "./PhotoManager";
import { api } from "./api";

type Row = Record<string, unknown> & { id?: string };
type Refs = { sites: Row[]; tzadikim: Row[] };

export default function AdminApp({ loggedIn }: { loggedIn: boolean }) {
  return loggedIn ? <Dashboard /> : <Login />;
}

function Login() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="card p-6 max-w-sm mx-auto flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
          router.refresh();
        } catch (err) {
          setMsg((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h1 className="text-xl font-bold">כניסה לניהול</h1>
      <input className="input" type="password" placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" autoFocus />
      <button className="btn btn-primary justify-center" disabled={busy}>כניסה</button>
      {msg && <p className="text-sm text-red-700">{msg}</p>}
    </form>
  );
}

function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Entity>(ENTITIES[0]);
  const [refs, setRefs] = useState<Refs>({ sites: [], tzadikim: [] });
  const [stats, setStats] = useState<{ subscribers: number | null; calls24h: number | null } | null>(null);

  const fetchRefs = useCallback(async () => {
    const [sites, tzadikim, st] = await Promise.all([
      api<Row[]>("/api/admin/sites"),
      api<Row[]>("/api/admin/tzadikim"),
      api<{ subscribers: number | null; calls24h: number | null }>("/api/admin/stats"),
    ]);
    return { refs: { sites, tzadikim }, stats: st };
  }, []);
  const apply = useCallback((r: { refs: Refs; stats: { subscribers: number | null; calls24h: number | null } }) => {
    setRefs(r.refs);
    setStats(r.stats);
  }, []);
  const loadRefs = useCallback(() => fetchRefs().then(apply), [fetchRefs, apply]);
  useEffect(() => { fetchRefs().then(apply).catch(() => {}); }, [fetchRefs, apply]);

  async function logout() {
    await api("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {ENTITIES.map((e) => (
            <button key={e.table} className={`btn ${tab.table === e.table ? "btn-primary" : ""}`} onClick={() => setTab(e)}>{e.label}</button>
          ))}
        </div>
        <div className="text-sm text-muted flex gap-3 items-center flex-wrap">
          {stats?.subscribers != null && <span>נרשמים לעדכון טלפוני: {stats.subscribers}</span>}
          {stats?.calls24h != null && <span>שיחות ב-24 שעות: {stats.calls24h}</span>}
          <button className="btn" onClick={logout}>יציאה</button>
        </div>
      </div>
      <EntityEditor key={tab.table} entity={tab} refs={refs} onChange={loadRefs} />
    </div>
  );
}

function EntityEditor({ entity, refs, onChange }: { entity: Entity; refs: Refs; onChange: () => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    try {
      return { rows: await api<Row[]>(`/api/admin/${entity.table}`), error: null };
    } catch (e) {
      return { rows: [] as Row[], error: (e as Error).message };
    }
  }, [entity]);
  const applyRows = useCallback((r: { rows: Row[]; error: string | null }) => {
    setRows(r.rows);
    if (r.error) setError(r.error);
  }, []);
  const load = useCallback(() => fetchRows().then(applyRows), [fetchRows, applyRows]);
  useEffect(() => { fetchRows().then(applyRows); }, [fetchRows, applyRows]);

  async function save(row: Row) {
    setError(null);
    const { id, ...rest } = row;
    try {
      const saved = id
        ? await api<Row>(`/api/admin/${entity.table}/${id}`, { method: "PUT", body: JSON.stringify(rest) })
        : await api<Row>(`/api/admin/${entity.table}`, { method: "POST", body: JSON.stringify(rest) });
      setEditing(saved);
      await load();
      onChange();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove(row: Row) {
    if (!row.id || !window.confirm("למחוק?")) return;
    try {
      await api(`/api/admin/${entity.table}/${row.id}`, { method: "DELETE" });
      setEditing(null);
      await load();
      onChange();
    } catch (e) {
      setError((e as Error).message);
    }
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
            {entity.table === "tzadikim" && editing.id ? <PhotoManager tzadikId={String(editing.id)} /> : null}
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
  entity: Entity; row: Row; refs: Refs;
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
