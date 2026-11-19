import SubscribeForm from "@/components/SubscribeForm";

/** תיבת הרשמה קטנה לעדכונים במייל (לצד הדף). */
export default function SubscribeBox() {
  return (
    <div className="night-sky rounded-2xl p-5 text-[#f6efe1] w-full max-w-[300px] mx-auto">
      <div className="font-display text-xl font-bold gold-text mb-1">📬 הילולות למייל</div>
      <p className="text-white/75 text-sm leading-6 mb-3">כל יום בצהריים: ההילולות של הערב. אפשר גם לקבל עדכון על כל סעודת הילולה חדשה.</p>
      <SubscribeForm compact />
    </div>
  );
}
