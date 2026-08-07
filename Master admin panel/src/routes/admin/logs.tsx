import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, DataTable, FilterBar, Input, Button } from "@/components/admin/ui";
import { fmtDateTime } from "@/lib/admin-mock";
import { useAuditLogs } from "@/lib/use-admin-api";
import type { AuditLogRow } from "@/lib/api";

function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLogs({ page: String(page), limit: "50" });

  const rows: AuditLogRow[] = (data as any)?.logs ?? [];
  const totalPages: number = (data as any)?.pagination?.totalPages ?? 1;
  const total: number = (data as any)?.pagination?.total ?? 0;

  return (
    <div>
      <PageHeader title="Audit Logs" description={`${total} recorded admin actions`} />
      <FilterBar>
        <span className="text-xs text-muted-foreground">{rows.length} entries shown</span>
      </FilterBar>
      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No audit logs yet. Admin actions will appear here.</div>
      ) : (
        <div className="rounded-xl border bg-card p-2">
          <DataTable
            rows={rows}
            columns={[
              { key: "time", header: "Time", render: (l: AuditLogRow) => <span className="text-xs font-mono">{fmtDateTime(l.createdAt)}</span> },
              { key: "admin", header: "Admin", render: (l: AuditLogRow) => <span className="text-xs">{l.adminEmail ?? l.adminId}</span> },
              { key: "ip", header: "IP", render: (l: AuditLogRow) => <span className="font-mono text-xs">{l.ip}</span> },
              { key: "action", header: "Action", render: (l: AuditLogRow) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{l.action}</code> },
              { key: "entity", header: "Entity", render: (l: AuditLogRow) => <span className="text-sm">{l.entity}</span> },
              { key: "id", header: "Target ID", render: (l: AuditLogRow) => <span className="font-mono text-xs">{l.entityId}</span> },
            ]}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t text-sm">
              <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
              <span className="text-muted-foreground">{page} / {totalPages}</span>
              <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/logs")({ component: AuditLogsPage });
