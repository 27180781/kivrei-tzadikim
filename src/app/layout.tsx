import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Frank_Ruhl_Libre, Heebo } from "next/font/google";
import Candle from "@/components/Candle";
import "./globals.css";

const heebo = Heebo({ variable: "--font-heebo", subsets: ["hebrew", "latin"] });
const frank = Frank_Ruhl_Libre({ variable: "--font-frank", subsets: ["hebrew", "latin"], weight: ["400", "500", "700", "900"] });

export const metadata: Metadata = {
  title: { default: "קברי צדיקים", template: "%s | קברי צדיקים" },
  description: "מידע על קברי צדיקים: דרכי הגעה, אודות, תמונות, הילולות יומיות וסעודות הילולה.",
  appleWebApp: { capable: true, title: "קברי צדיקים", statusBarStyle: "black-translucent" },
  // האתר בעברית: מונע מגוגל/כרום להציע תרגום
  other: { google: "notranslate", "content-language": "he" },
};

export const viewport: Viewport = { themeColor: "#0e1a2b" };

const nav = [
  { href: "/", label: "ראשי" },
  { href: "/tzadikim", label: "הצדיקים" },
  { href: "/hillulot", label: "לוח הילולות" },
  { href: "/seudot", label: "סעודות הילולה" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" translate="no" className={`${heebo.variable} ${frank.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <header className="sticky top-0 z-[1000] bg-night/90 text-[#f6efe1] backdrop-blur-md border-b border-white/10">
          <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Candle className="w-6 h-9" />
              <span className="font-display text-2xl font-bold gold-text">קברי צדיקים</span>
            </Link>
            <nav className="hidden md:flex gap-1 text-[15px]">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="px-3 py-2 rounded-full hover:bg-white/10 hover:text-gold transition-colors">
                  {n.label}
                </Link>
              ))}
            </nav>
            <Link href="/app" className="btn btn-primary !py-2 text-sm">🧭 ניווט לציונים</Link>
          </div>
          <nav className="md:hidden flex gap-1 overflow-x-auto px-3 pb-2 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="px-3 py-1.5 rounded-full bg-white/5 whitespace-nowrap">{n.label}</Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 pt-8 pb-16">{children}</main>
        <footer className="night-sky border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6 sm:grid-cols-3 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Candle className="w-5 h-8" />
                <span className="font-display text-xl gold-text font-bold">קברי צדיקים</span>
              </div>
              <p className="text-white/70 leading-6">מידע על ציוני צדיקים, דרכי הגעה, הילולות וסעודות. זכותם תגן עלינו.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              {nav.map((n) => <Link key={n.href} href={n.href} className="text-white/80 hover:text-gold">{n.label}</Link>)}
              <Link href="/app" className="text-white/80 hover:text-gold">אפליקציית ניווט</Link>
            </div>
            <p className="text-white/60 leading-6">התאריכים מחושבים לפי הלוח העברי בארץ ישראל. היום העברי מתחלף בשקיעה.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
