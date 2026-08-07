import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Input, Button } from "@/components/admin/ui";
import { usePlatformSettings, useSavePlatformSetting } from "@/lib/use-admin-api";
import type { PlatformSettingRow } from "@/lib/api";
import { Save, Plus } from "lucide-react";

const DEFAULT_SETTINGS = [
  { key: "platform_name", label: "Platform Name", type: "string", defaultValue: "GhostBus" },
  { key: "platform_commission_pct", label: "Platform Commission (%)", type: "number", defaultValue: "28" },
  { key: "min_track_price", label: "Minimum Track Price (€)", type: "number", defaultValue: "149" },
  { key: "max_track_price", label: "Maximum Track Price (€)", type: "number", defaultValue: "2000" },
  { key: "maintenance_mode", label: "Maintenance Mode", type: "boolean", defaultValue: "false" },
  { key: "support_email", label: "Support Email", type: "string", defaultValue: "support@ghostbus.audio" },
  { key: "seller_applications_open", label: "Seller Applications Open", type: "boolean", defaultValue: "true" },
];

function SettingsPage() {
  const { data, isLoading } = usePlatformSettings();
  const save = useSavePlatformSetting();
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const settings: PlatformSettingRow[] = (data as any)?.settings ?? [];

  // Merge defaults with actual saved settings
  const mergedSettings = DEFAULT_SETTINGS.map(def => {
    const saved = settings.find(s => s.key === def.key);
    return {
      ...def,
      value: saved?.value ?? def.defaultValue,
      id: saved?.id ?? null,
      updatedBy: saved?.updatedBy ?? null,
    };
  });

  // Also show any custom settings not in defaults
  const customSettings = settings.filter(s => !DEFAULT_SETTINGS.find(d => d.key === s.key));

  const handleSave = async (key: string, type: string) => {
    const value = editedValues[key];
    if (value === undefined) return;
    await save.mutateAsync({ key, value, type });
    setEditedValues(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    await save.mutateAsync({ key: newKey.trim(), value: newValue, type: "string" });
    setNewKey(""); setNewValue("");
  };

  return (
    <div>
      <PageHeader title="Platform Settings" description="Configure global platform behavior and pricing." />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="space-y-6">
          {/* Core Settings */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Core Configuration</h3>
            <div className="space-y-4">
              {mergedSettings.map(setting => {
                const currentValue = editedValues[setting.key] ?? setting.value;
                const isDirty = editedValues[setting.key] !== undefined;

                return (
                  <div key={setting.key} className="flex items-center gap-4">
                    <div className="w-52 shrink-0">
                      <label className="text-sm font-medium">{setting.label}</label>
                      <p className="text-[10px] text-muted-foreground font-mono">{setting.key}</p>
                    </div>
                    <div className="flex-1">
                      {setting.type === "boolean" ? (
                        <button
                          onClick={() => setEditedValues({ ...editedValues, [setting.key]: currentValue === "true" ? "false" : "true" })}
                          className={`relative w-12 h-7 rounded-full transition-colors ${currentValue === "true" ? "bg-primary" : "bg-muted"}`}
                        >
                          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${currentValue === "true" ? "left-6" : "left-1"}`} />
                        </button>
                      ) : (
                        <Input
                          type={setting.type === "number" ? "number" : "text"}
                          value={currentValue}
                          onChange={e => setEditedValues({ ...editedValues, [setting.key]: e.target.value })}
                          className="w-full max-w-xs"
                        />
                      )}
                    </div>
                    {isDirty && (
                      <Button size="sm" onClick={() => handleSave(setting.key, setting.type)} disabled={save.isPending}>
                        <Save className="h-3.5 w-3.5" /> Save
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Settings */}
          {customSettings.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Custom Settings</h3>
              <div className="space-y-3">
                {customSettings.map(s => (
                  <div key={s.id} className="flex items-center gap-4 text-sm">
                    <code className="w-48 shrink-0 text-xs bg-muted px-2 py-1 rounded">{s.key}</code>
                    <Input
                      value={editedValues[s.key] ?? s.value}
                      onChange={e => setEditedValues({ ...editedValues, [s.key]: e.target.value })}
                      className="flex-1 max-w-xs"
                    />
                    {editedValues[s.key] !== undefined && (
                      <Button size="sm" onClick={() => handleSave(s.key, s.type)} disabled={save.isPending}>Save</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Setting */}
          <form onSubmit={handleAddCustom} className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Add Custom Setting</h3>
            <div className="flex gap-3">
              <Input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="setting_key" className="w-48" required />
              <Input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="value" className="flex-1" />
              <Button type="submit" disabled={save.isPending}><Plus className="h-4 w-4" /> Add</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });
