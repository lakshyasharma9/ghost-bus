import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Tabs, DataTable, StatusBadge, Button } from "@/components/admin/ui";
import { refunds, fmtDate, fmtMoney } from "@/lib/admin-mock";

function RefundsPage() {
  const [tab, setTab] = useState<"requested" | "approved" | "rejected" | "all">("requested");
  const rows = tab === "all" ? refunds : refunds.filter(r => r.status === tab);

  return (
    <div>
      <PageHeader title="Refunds" description="Manage buyer refund requests and Stripe refunds." />
      <Tabs
        active={tab}
        onChange={t => setTab(t as typeof tab)}
        tabs={[
          { id: "requested", label: "Requested", count: refunds.filter(r => r.status === "requested").length },
          { id: "approved", label: "Approved", count: refunds.filter(r => r.status === "approved").length },
          { id: "rejected", label: "Rejected", count: refunds.filter(r => r.status === "rejected").length },
          { id: "all", label: "All", count: refunds.length },
        ]}
      />
      <div className="rounded-xl border bg-card p-2">
        <DataTable
          rows={rows}
          columns={[
            { key: "id", header: "Refund", render: r => <span className="font-mono text-xs">{r.id}</span> },
            { key: "order", header: "Order", render: r => <span className="font-mono text-xs">{r.orderId}</span> },
            { key: "buyer", header: "Buyer", render: r => r.buyer },
            { key: "amount", header: "Amount", render: r => fmtMoney(r.amount) },
            { key: "reason", header: "Reason", render: r => <span className="text-sm">{r.reason}</span> },
            { key: "status", header: "Status", render: r => <StatusBadge status={r.status} /> },
            { key: "date", header: "Requested", render: r => <span className="text-xs">{fmtDate(r.requested)}</span> },
            { key: "actions", header: "", render: r => (
              <div className="flex justify-end gap-1">
                {r.status === "requested" && <>
                  <Button size="sm" variant="success">Approve & refund</Button>
                  <Button size="sm" variant="danger">Reject</Button>
                </>}
              </div>
            ), className: "text-right" },
          ]}
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/refunds")({ component: RefundsPage });
