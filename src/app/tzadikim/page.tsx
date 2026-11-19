import type { Metadata } from "next";
import { getTzadikim } from "@/lib/db";
import TzadikCard from "@/components/TzadikCard";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "הצדיקים" };

export default async function TzadikimPage({ searchParams }: PageProps<"/tzadikim">) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  const all = await getTzadikim();
  const list = query
    ? all.filter((t) => [t.name, ...(t.aka ?? []), t.site?.name, t.site?.city].some((s) => s?.includes(query)))
    : all;
  return (
    <div>
      <PageHeader title="הצדיקים" subtitle="תולדות חייהם, מקום הציון, דרכי הגעה ומועד ההילולה.">
        <form className="flex gap-2 max-w-lg">
          <input name="q" defaultValue={query} placeholder="חיפוש לפי שם, כינוי או עיר" className="input !rounded-full !bg-white/95 !text-night !border-transparent" />
          <button className="btn btn-primary !px-6">חיפוש</button>
        </form>
      </PageHeader>
      {query && <p className="text-muted mb-4">נמצאו {list.length} תוצאות עבור &quot;{query}&quot;</p>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => <TzadikCard key={t.id} t={t} />)}
      </div>
      {!list.length && <p className="card p-6 text-muted text-center">לא נמצאו תוצאות.</p>}
    </div>
  );
}
