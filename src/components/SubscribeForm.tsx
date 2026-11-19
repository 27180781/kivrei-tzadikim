"use client";

import { useState } from "react";

export default function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [daily, setDaily] = useState(true);
  const [seudot, setSeudot] = useState(true);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, daily, seudot }) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) setState("done");
    else { setState("error"); setMsg(j.error ?? "שגיאה"); }
  }

  if (state === "done") {
    return <div className="rounded-2xl bg-gold/15 border border-gold/40 p-4 text-center">📬 שלחנו לכם מייל לאישור ההרשמה. לחצו על הקישור שבו כדי להתחיל לקבל התראות.</div>;
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className={`flex gap-2 ${compact ? "flex-col" : ""}`}>
        <input type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
          className="input !rounded-full !bg-white/95 !text-night text-left" />
        <button className="btn btn-primary !px-6 whitespace-nowrap" disabled={state === "busy"}>{state === "busy" ? "שולח…" : "הרשמה"}</button>
      </div>
      <div className={`flex gap-4 flex-wrap text-sm ${compact ? "" : "mt-1"}`}>
        <label className="flex items-center gap-2"><input type="checkbox" className="size-4 accent-[#a57a2c]" checked={daily} onChange={(e) => setDaily(e.target.checked)} /> מייל יומי עם ההילולות</label>
        <label className="flex items-center gap-2"><input type="checkbox" className="size-4 accent-[#a57a2c]" checked={seudot} onChange={(e) => setSeudot(e.target.checked)} /> עדכונים על סעודות הילולה</label>
      </div>
      {state === "error" && <p className="text-sm text-red-400">{msg}</p>}
    </form>
  );
}
