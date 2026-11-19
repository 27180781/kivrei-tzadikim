import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SubscribeForm from "@/components/SubscribeForm";

export const metadata: Metadata = { title: "התראות במייל" };

export default async function SubscribePage({ searchParams }: PageProps<"/subscribe">) {
  const sp = await searchParams;
  return (
    <div>
      <PageHeader title="התראות במייל" subtitle="קבלו כל יום את ההילולות שחלות באותו ערב, ועדכונים על סעודות הילולה חדשות, מעודכנות או מבוטלות.">
        <div className="max-w-xl">
          {sp.removed ? <p className="text-gold-soft mb-4">הוסרתם מרשימת התפוצה. אפשר להירשם מחדש בכל עת.</p> : null}
          {sp.invalid ? <p className="text-gold-soft mb-4">הקישור לא תקין או שפג תוקפו. אפשר להירשם שוב.</p> : null}
          <SubscribeForm />
        </div>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { i: "🕯️", t: "מייל יומי", d: "בצהריים, עם ההילולות שמתחילות באותו ערב בשקיעה ודרכי ההגעה." },
          { i: "🍽️", t: "סעודות הילולה", d: "התראה כשמתפרסמת סעודה חדשה, או כשסעודה מתעדכנת או מתבטלת." },
          { i: "✋", t: "בלי ספאם", d: "בכל מייל יש קישור לשינוי ההעדפות ולהסרה בלחיצה אחת." },
        ].map((x) => (
          <div key={x.t} className="card p-5">
            <div className="text-3xl">{x.i}</div>
            <div className="font-display text-xl font-bold mt-2">{x.t}</div>
            <p className="text-muted text-sm mt-1 leading-6">{x.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
