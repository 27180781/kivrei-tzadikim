"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type P = { id: string; storage_path: string; caption: string | null };

export default function PhotoManager({ sb, tzadikId }: { sb: SupabaseClient; tzadikId: string }) {
  const [photos, setPhotos] = useState<P[]>([]);
  const [busy, setBusy] = useState(false);

  const fetchPhotos = useCallback(async (): Promise<P[]> => {
    const { data } = await sb.from("photos").select("id,storage_path,caption").eq("tzadik_id", tzadikId).order("sort");
    return data ?? [];
  }, [sb, tzadikId]);
  const load = useCallback(() => fetchPhotos().then(setPhotos), [fetchPhotos]);
  useEffect(() => { fetchPhotos().then(setPhotos); }, [fetchPhotos]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      const path = `${tzadikId}/${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`;
      const up = await sb.storage.from("photos").upload(path, f);
      if (!up.error) await sb.from("photos").insert({ tzadik_id: tzadikId, storage_path: path, sort: photos.length });
    }
    setBusy(false);
    load();
  }

  async function remove(p: P) {
    if (!window.confirm("למחוק את התמונה?")) return;
    await sb.storage.from("photos").remove([p.storage_path]);
    await sb.from("photos").delete().eq("id", p.id);
    load();
  }

  return (
    <div className="border-t border-border pt-3 mt-2 flex flex-col gap-2">
      <div className="font-semibold">תמונות</div>
      <div className="flex gap-2 flex-wrap">
        {photos.map((p) => (
          <div key={p.id} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sb.storage.from("photos").getPublicUrl(p.storage_path).data.publicUrl} alt="" className="h-24 rounded-lg object-cover" />
            <button type="button" onClick={() => remove(p)} className="absolute top-1 left-1 bg-black/60 text-white text-xs rounded px-1">✕</button>
          </div>
        ))}
      </div>
      <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => upload(e.target.files)} />
      {busy && <span className="text-sm text-muted">מעלה…</span>}
    </div>
  );
}
