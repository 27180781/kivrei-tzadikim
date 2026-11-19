"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

type P = { id: string; caption: string | null };

export default function PhotoManager({ tzadikId }: { tzadikId: string }) {
  const [photos, setPhotos] = useState<P[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(() => api<P[]>(`/api/admin/photos?tzadik_id=${tzadikId}`), [tzadikId]);
  const load = useCallback(() => fetchPhotos().then(setPhotos), [fetchPhotos]);
  useEffect(() => { fetchPhotos().then(setPhotos).catch(() => {}); }, [fetchPhotos]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.set("tzadik_id", tzadikId);
    for (const f of Array.from(files)) form.append("file", f);
    try {
      await api("/api/admin/photos", { method: "POST", body: form });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: P) {
    if (!window.confirm("למחוק את התמונה?")) return;
    await api(`/api/admin/photos/${p.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="border-t border-border pt-3 mt-2 flex flex-col gap-2">
      <div className="font-semibold">תמונות</div>
      <div className="flex gap-2 flex-wrap">
        {photos.map((p) => (
          <div key={p.id} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/photos/${p.id}`} alt="" className="h-24 rounded-lg object-cover" />
            <button type="button" onClick={() => remove(p)} className="absolute top-1 left-1 bg-black/60 text-white text-xs rounded px-1">✕</button>
          </div>
        ))}
      </div>
      <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => upload(e.target.files)} />
      {busy && <span className="text-sm text-muted">מעלה…</span>}
      {error && <span className="text-sm text-red-700">{error}</span>}
    </div>
  );
}
