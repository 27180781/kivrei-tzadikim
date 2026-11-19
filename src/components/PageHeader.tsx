export default function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="full-bleed night-sky -mt-8 mb-10">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16 fade-up">
        <h1 className="font-display text-4xl md:text-5xl font-black gold-text">{title}</h1>
        {subtitle && <p className="text-white/75 text-lg mt-3 max-w-2xl leading-8">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}
