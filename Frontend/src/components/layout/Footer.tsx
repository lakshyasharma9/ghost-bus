import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border bg-[--color-surface]">
      <div className="container-app py-16 grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#5BA7FF] grid place-items-center text-white font-bold text-sm">G</div>
            <span className="font-semibold tracking-tight text-[17px]">GhostBus</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
            The premium ghost production marketplace. Exclusive tracks, full rights transfer, one sale only.
          </p>
        </div>
        <Col title="Marketplace" links={[["Browse", "/tracks"], ["Genres", "/tracks"], ["Top Labels", "/tracks"], ["New Releases", "/tracks"]]} />
        <Col title="For Producers" links={[["Start Selling", "/sell"], ["Services", "/services"], ["KYC", "/dashboard"], ["Resources", "/how-we-work"]]} />
        <Col title="Company" links={[["How We Work", "/how-we-work"], ["About", "/how-we-work"], ["Contact", "/how-we-work"], ["Press", "/how-we-work"]]} />
      </div>
      <div className="container-app py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>© 2026 GhostBus. All rights reserved.</span>
        <span className="flex gap-5">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">License</a>
        </span>
      </div>
    </footer>
  );
}

function Col({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="label-eyebrow mb-4">{title}</div>
      <ul className="space-y-2.5">
        {links.map(([l, to]) => (
          <li key={l}>
            <Link to={to} className="text-sm text-foreground/80 hover:text-primary">{l}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
