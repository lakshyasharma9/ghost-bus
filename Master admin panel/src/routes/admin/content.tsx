import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Button } from "@/components/admin/ui";
import { usePlatformSettings, useSavePlatformSetting } from "@/lib/use-admin-api";
import { useState } from "react";
import { FileText, ArrowRight } from "lucide-react";

const CONTENT_BLOCKS = [
  { key: "hero_heading", label: "Hero Heading", description: "Main homepage hero title", defaultValue: "World's No. 1 Premium Ghost Production Marketplace" },
  { key: "hero_subtext", label: "Hero Subtext", description: "Subtitle below the hero heading", defaultValue: "Buy Exclusive, Release-Ready Tracks From Verified Ghost Producers." },
  { key: "announcement_text", label: "Announcement Banner", description: "Optional top banner text (leave empty to hide)", defaultValue: "" },
  { key: "footer_text", label: "Footer Text", description: "Footer copyright text", defaultValue: "© 2026 GhostBus. All rights reserved." },
];

function ContentManagementPage() {
  const { data, isLoading } = usePlatformSettings();
  const save = useSavePlatformSetting();
  const settings = (data as any)?.settings ?? [];
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  const getSettingValue = (key: string, defaultValue: string) => {
    const found = settings.find((s: any) => s.key === key);
    return editedValues[key] ?? found?.value ?? defaultValue;
  };

  const handleSave = async (key: string) => {
    const value = editedValues[key];
    if (value === undefined) return;
    await save.mutateAsync({ key, value, type: "string" });
    setEditedValues(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  return (
    <div>
      <PageHeader
        title="Content Management"
        description="Manage homepage text, announcements, and static content blocks."
        actions={
          <Link to="/admin/blog" className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition">
            <FileText className="h-4 w-4" /> Manage Blog Posts <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="space-y-4">
          {CONTENT_BLOCKS.map(block => {
            const value = getSettingValue(block.key, block.defaultValue);
            const isDirty = editedValues[block.key] !== undefined;

            return (
              <div key={block.key} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-sm">{block.label}</h3>
                    <p className="text-xs text-muted-foreground">{block.description}</p>
                  </div>
                  {isDirty && (
                    <Button size="sm" onClick={() => handleSave(block.key)} disabled={save.isPending}>
                      Save
                    </Button>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={value}
                  onChange={e => setEditedValues({ ...editedValues, [block.key]: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                  placeholder={block.defaultValue || "Enter content..."}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 p-5 rounded-xl border bg-muted/30">
        <h3 className="font-semibold text-sm mb-2">Blog Content</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Blog articles are managed through the dedicated Blog CMS. You can create, edit, publish, and delete articles there.
        </p>
        <Link to="/admin/blog" className="text-sm text-primary font-medium hover:underline">
          Go to Blog Management →
        </Link>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/content")({ component: ContentManagementPage });
