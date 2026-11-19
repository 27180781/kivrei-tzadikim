import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({ variable: "--font-heebo", subsets: ["hebrew", "latin"] });

export const metadata: Metadata = {
  title: { default: "קברי צדיקים", template: "%s | קברי צדיקים" },
  description: "מידע על קברי צדיקים: דרכי הגעה, אודות, תמונות, הילולות יומיות וסעודות הילולה.",
  appleWebApp: { capable: true, title: "קברי צדיקים", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#8a5a12" };

const nav = [
  { href: "/", label: "ראשי" },
  { href: "/tzadikim", label: "הצדיקים" },
  { href: "/hillulot", label: "לוח הילולות" },
  { href: "/seudot", label: "סעודות הילולה" },
  { href: "/app", label: "ניווט" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-[1000]">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <Link href="/" className="text-xl font-bold text-accent">קברי צדיקים</Link>
            <nav className="flex gap-1 text-sm flex-wrap">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="px-3 py-1.5 rounded-lg hover:bg-accent-soft">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
        <footer className="border-t border-border text-center text-sm text-muted py-4">
          התאריכים מחושבים לפי לוח עברי בארץ ישראל. היום העברי מתחלף בשקיעה.
        </footer>
      </body>
    </html>
  );
}
