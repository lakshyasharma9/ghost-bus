import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-16 md:mt-32 border-t border-border bg-[--color-surface]">
      <div className="container-app py-10 md:py-16 grid sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
        {/* Brand column */}
        <div className="md:col-span-2 sm:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#060226] to-[#1a0a5e] grid place-items-center text-white font-bold text-sm">G</div>
            <span className="font-semibold tracking-tight text-[17px]">GhostBus</span>
          </div>
          {/* SEO paragraph — required by client spec */}
          <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
            GHOSTBUS is the premium EDM ghost production marketplace to buy exclusive release-ready tracks, hire ghost producers, and access professional music production services for DJs, artists, and record labels worldwide.
          </p>
        </div>

        <Col
          title="Marketplace"
          links={[
            ["Browse Tracks", "/tracks"],
            ["Genres", "/tracks"],
            ["New Releases", "/tracks"],
            ["How We Work", "/how-we-work"],
          ]}
        />
        <Col
          title="For Producers"
          links={[
            ["Start Selling", "/sell"],
            ["How to Upload Tracks", "/how-to-upload-tracks"],
            ["Seller Agreement", "/seller-agreement"],
            ["FAQ", "/faq"],
          ]}
        />
        <Col
          title="Company"
          links={[
            ["How We Work", "/how-we-work"],
            ["What Is Ghost Production?", "/what-is-ghost-production"],
            ["What Is a Ghost Producer?", "/what-is-ghost-producer"],
            ["Blog", "/blog"],
            ["FAQ", "/faq"],
            ["Contact Us", "/contact"],
          ]}
        />
      </div>

      {/* Secondary footer row */}
      <div className="container-app py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>© 2026 GhostBus. All rights reserved.</span>
        <span className="flex flex-wrap gap-4 justify-center">
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms &amp; Conditions</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to="/licensing-legal" className="hover:text-foreground transition-colors">Licensing &amp; Legal</Link>
          <Link to="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link>
          <Link to="/dmca" className="hover:text-foreground transition-colors">DMCA</Link>
          <Link to="/seller-agreement" className="hover:text-foreground transition-colors">Seller Agreement</Link>
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
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to as any} className="text-sm text-foreground/80 hover:text-primary transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
