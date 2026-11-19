"use client";

import { useState } from "react";

export default function ManageForm(props: { token: string; daily: boolean; seudot: boolean }) {
  const [daily, setDaily] = useState(props.daily);
  const [seudot, setSeudot] = useState(props.seudot);
  const [msg, setMsg] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);

  async function save(unsubscribe = false) {
    const res = await fetch("/api/subscribe/manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: props.token, daily, seudot, unsubscribe }) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(j.error ?? "שגיאה");
    if (j.removed) setRemoved(true);
    else setMsg("ההגדרות נשמרו");
  }

  if (removed) return <p className="card p-6 text-center">הוסרתם מרשימת התפוצה. לא תקבלו מאיתנו יותר מיילים.</p>;
  return (
    <div className="card p-6 flex flex-col gap-4">
      <label className="flex items-center gap-3"><input type="checkbox" className="size-5 accent-[#a57a2c]" checked={daily} onChange={(e) => setDaily(e.target.checked)} /> מייל יומי עם ההילולות</label>
      <label className="flex items-center gap-3"><input type="checkbox" className="size-5 accent-[#a57a2c]" checked={seudot} onChange={(e) => setSeudot(e.target.checked)} /> עדכונים על סעודות הילולה</label>
      <div className="flex gap-2 flex-wrap">
        <button className="btn btn-primary" onClick={() => save()}>שמירה</button>
        <button className="btn text-red-700" onClick={() => save(true)}>הסרה מכל ההתראות</button>
      </div>
      {msg && <p className="text-sm text-muted">{msg}</p>}
    </div>
  );
}
