import type { Metadata } from "next";
import { getTzadikim } from "@/lib/db";
import TzadikCard from "@/components/TzadikCard";

export const metadata: Metadata = { title: "הצדיקים" };

export default async function TzadikimPage({ searchParams }: PageProps<"/tzadikim">) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  const all = await getTzadikim();
  const list = query
    ? all.filter((t) => [t.name, ...(t.aka ?? []), t.site?.name, t.site?.city].some((s) => s?.includes(query)))
    : all;
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">הצדיקים</h1>
      <form className="flex gap-2">
        <input name="q" defaultValue={query} placeholder="חיפוש לפי שם, כינוי או עיר" className="input" />
        <button className="btn btn-primary">חיפוש</button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((t) => <TzadikCard key={t.id} t={t} />)}
      </div>
      {!list.length && <p className="text-muted">לא נמצאו תוצאות.</p>}
    </div>
  );
}
