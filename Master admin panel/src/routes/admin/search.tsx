import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Input } from "@/components/admin/ui";
import { Search } from "lucide-react";
import { useAdminSearch } from "@/lib/use-admin-api";

function GlobalSearchPage() {
  const [q, setQ] = useState("");
  const { data, isLoading, isFetching } = useAdminSearch(q);

  const results = data as any;
  const hasResults = results && (
    results.users?.length || results.tracks?.length ||
    results.orders?.length || results.tickets?.length
  );

  return (
    <div>
      <PageHeader title="Global Search" description="Search across users, tracks, orders, and tickets." />
      <div className="relative max-w-2xl mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Search anything…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="w-full pl-9 h-11 text-base"
        />
        {(isLoading || isFetching) && q.length >= 2 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Searching…</span>
        )}
      </div>

      {q.length < 2 ? (
        <p className="text-sm text-muted-foreground">Type at least 2 characters to search.</p>
      ) : !hasResults ? (
        <p className="text-sm text-muted-foreground">No results found for "{q}".</p>
      ) : (
        <div className="space-y-6">
          {results.users?.length > 0 && (
            <Section title="Users" items={results.users} linkBase="/admin/users" labelFn={(u: any) => u.fullName ?? u.email} />
          )}
          {results.tracks?.length > 0 && (
            <Section title="Tracks" items={results.tracks} linkBase="/admin/tracks" labelFn={(t: any) => `${t.title} (${t.genre})`} />
          )}
          {results.orders?.length > 0 && (
            <Section title="Orders" items={results.orders} linkBase="/admin/orders" labelFn={(o: any) => `${o.id.slice(0, 8)}… — ${o.status}`} />
          )}
          {results.tickets?.length > 0 && (
            <Section title="Support Tickets" items={results.tickets} linkBase="/admin/support" labelFn={(t: any) => `${t.ticketNumber} — ${t.subject}`} />
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, items, linkBase, labelFn }: {
  title: string; items: any[]; linkBase: string; labelFn: (item: any) => string;
}) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title} · {items.length}</h3>
      <ul className="rounded-lg border bg-card divide-y">
        {items.map((item: any) => (
          <li key={item.id} className="px-4 py-3 text-sm hover:bg-muted/40">
            <Link to={linkBase} className="flex justify-between items-center">
              <span className="font-medium">{labelFn(item)}</span>
              <span className="text-xs font-mono text-muted-foreground">{item.id.slice(0, 8)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export const Route = createFileRoute("/admin/search")({ component: GlobalSearchPage });
