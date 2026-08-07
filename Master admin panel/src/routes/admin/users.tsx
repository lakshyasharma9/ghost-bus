import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, DataTable, StatusBadge, FilterBar, Input, Select, Button } from "@/components/admin/ui";
import { fmtDate } from "@/lib/admin-mock";
import { useAdminUsers, useSuspendUser, useRestoreUser } from "@/lib/use-admin-api";
import type { AdminUserRow } from "@/lib/api";

function UsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), limit: "20" };
  if (q) params.search = q;
  if (role) params.role = role;
  if (status) params.status = status;

  const { data, isLoading, error } = useAdminUsers(params);
  const suspend = useSuspendUser();
  const restore = useRestoreUser();

  const rows: AdminUserRow[] = (data as any)?.users ?? [];
  const total: number = (data as any)?.pagination?.total ?? 0;
  const totalPages: number = (data as any)?.pagination?.totalPages ?? 1;

  return (
    <div>
      <PageHeader title="Users" description={`${total} registered users`} />
      <FilterBar>
        <Input placeholder="Search name or email…" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} className="w-72" />
        <Select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          <option value="BUYER">Buyer</option>
          <option value="SELLER">Seller</option>
          <option value="ADMIN">Admin</option>
        </Select>
        <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </Select>
        <span className="ml-auto text-xs text-muted-foreground">{rows.length} of {total}</span>
      </FilterBar>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-6">
          <p className="font-semibold mb-1">Failed to load users</p>
          <p className="text-xs">{(error as Error).message}</p>
          <p className="text-xs mt-2 text-muted-foreground">Make sure you are logged in as an ADMIN and the backend is running.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-2">
          <DataTable
            columns={[
              { key: "user", header: "User", render: (u: AdminUserRow) => (
                <div>
                  <p className="font-medium text-foreground text-sm">{u.fullName ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">@{u.username ?? u.email}</p>
                </div>
              )},
              { key: "email", header: "Email", render: (u: AdminUserRow) => <span className="text-sm">{u.email}</span> },
              { key: "role", header: "Role", render: (u: AdminUserRow) => <StatusBadge status={u.role === "SELLER" ? "approved" : "active"} /> },
              { key: "status", header: "Status", render: (u: AdminUserRow) => <StatusBadge status={u.isVerified ? "active" : "suspended"} /> },
              { key: "kyc", header: "KYC", render: (u: AdminUserRow) => <StatusBadge status={u.kycStatus?.toLowerCase()} /> },
              { key: "joined", header: "Joined", render: (u: AdminUserRow) => <span className="text-xs">{fmtDate(u.createdAt)}</span> },
              { key: "actions", header: "", render: (u: AdminUserRow) => (
                <div className="flex justify-end gap-1">
                  {u.isVerified
                    ? <Button size="sm" variant="secondary" onClick={() => suspend.mutate(u.id)} disabled={suspend.isPending}>Suspend</Button>
                    : <Button size="sm" variant="success" onClick={() => restore.mutate(u.id)} disabled={restore.isPending}>Restore</Button>}
                </div>
              ), className: "text-right" },
            ]}
            rows={rows}
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

export const Route = createFileRoute("/admin/users")({ component: UsersPage });
