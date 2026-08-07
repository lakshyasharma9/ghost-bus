import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Input, Button } from "@/components/admin/ui";
import { useFeatureFlags, useToggleFeatureFlag, useCreateFeatureFlag } from "@/lib/use-admin-api";
import type { FeatureFlagRow } from "@/lib/api";
import { AlertTriangle, Plus } from "lucide-react";

function FeatureFlagsPage() {
  const { data, isLoading } = useFeatureFlags();
  const toggle = useToggleFeatureFlag();
  const create = useCreateFeatureFlag();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCritical, setNewCritical] = useState(false);

  const flags: FeatureFlagRow[] = (data as any)?.flags ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await create.mutateAsync({ name: newName.trim(), description: newDesc.trim() || undefined, critical: newCritical });
    setNewName(""); setNewDesc(""); setNewCritical(false); setShowCreate(false);
  };

  return (
    <div>
      <PageHeader
        title="Feature Flags"
        description="Toggle platform features on/off in real-time."
        actions={<Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4" /> Add Flag</Button>}
      />

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 p-5 rounded-xl border bg-card space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="flag_name (snake_case)" required className="w-full" />
            <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description" className="w-full" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={newCritical} onChange={e => setNewCritical(e.target.checked)} className="w-4 h-4" />
            Mark as critical (requires confirmation to toggle)
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={create.isPending}>{create.isPending ? "Creating…" : "Create Flag"}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : flags.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No feature flags yet. Click "Add Flag" to create one.</div>
      ) : (
        <div className="space-y-2">
          {flags.map(flag => (
            <div key={flag.id} className="flex items-center gap-4 px-5 py-4 rounded-xl border bg-card">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-semibold bg-muted px-2 py-0.5 rounded">{flag.name}</code>
                  {flag.critical && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> CRITICAL
                    </span>
                  )}
                </div>
                {flag.description && <p className="text-xs text-muted-foreground mt-1">{flag.description}</p>}
                {flag.updatedBy && <p className="text-[10px] text-muted-foreground mt-0.5">Last updated by {flag.updatedBy}</p>}
              </div>
              <button
                onClick={() => {
                  if (flag.critical && !confirm(`⚠️ This is a CRITICAL flag. Are you sure you want to ${flag.enabled ? 'DISABLE' : 'ENABLE'} "${flag.name}"?`)) return;
                  toggle.mutate({ id: flag.id, enabled: !flag.enabled });
                }}
                disabled={toggle.isPending}
                className={`relative w-12 h-7 rounded-full transition-colors ${flag.enabled ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${flag.enabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/feature-flags")({ component: FeatureFlagsPage });
