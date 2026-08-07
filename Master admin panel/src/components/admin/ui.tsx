import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { Status } from "@/lib/admin-mock";

export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function KpiCard({
  label, value, hint, icon: Icon, tone = "default",
}: {
  label: string; value: string | number; hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warn" | "alert" | "success";
}) {
  const toneClass = {
    default: "text-primary bg-primary/10",
    warn: "text-[oklch(0.62_0.17_60)] bg-[oklch(0.78_0.17_80)]/15",
    alert: "text-destructive bg-destructive/10",
    success: "text-[oklch(0.5_0.17_150)] bg-[oklch(0.65_0.17_150)]/15",
  }[tone];
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("rounded-lg p-2", toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  requested: "bg-amber-100 text-amber-800 ring-amber-200",
  open: "bg-amber-100 text-amber-800 ring-amber-200",
  in_progress: "bg-amber-100 text-amber-800 ring-amber-200",
  approved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  active: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  completed: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  processed: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  delivered: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  resolved: "bg-slate-100 text-slate-700 ring-slate-200",
  rejected: "bg-rose-100 text-rose-800 ring-rose-200",
  failed: "bg-rose-100 text-rose-800 ring-rose-200",
  suspended: "bg-rose-100 text-rose-800 ring-rose-200",
  disputed: "bg-rose-100 text-rose-800 ring-rose-200",
  refunded: "bg-violet-100 text-violet-800 ring-violet-200",
  paused: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function StatusBadge({ status }: { status: Status | string }) {
  const cls = statusStyles[status] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset capitalize",
      cls,
    )}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function SectionCard({ title, description, actions, children }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border bg-card">
      {(title || actions) && (
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T extends { id: string }>({ columns, rows, empty }: { columns: Column<T>[]; rows: T[]; empty?: string }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium text-foreground">{empty ?? "No results"}</p>
        <p className="text-xs text-muted-foreground mt-1">Try changing your filters.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            {columns.map(c => (
              <th key={c.key} className={cn("py-3 pr-4 font-medium", c.className)}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-muted/40 transition-colors">
              {columns.map(c => (
                <td key={c.key} className={cn("py-3 pr-4 align-middle", c.className)}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Button({
  variant = "primary", size = "md", className, children, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" | "success"; size?: "sm" | "md" }) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "border bg-background text-foreground hover:bg-muted",
    ghost: "text-foreground hover:bg-muted",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
  };
  const sizes = { sm: "h-8 px-2.5 text-xs", md: "h-9 px-3.5 text-sm" };
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-50",
        variants[variant], sizes[size], className,
      )}
    >
      {children}
    </button>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">{children}</div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-9 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40",
        props.className,
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-9 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40",
        props.className,
      )}
    />
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 border-b mb-4">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            active === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
          {typeof t.count === "number" && (
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
