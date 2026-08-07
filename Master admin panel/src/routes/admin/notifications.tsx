import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Input, Select, Button } from "@/components/admin/ui";
import { useDashboardStats } from "@/lib/use-admin-api";
import { Send } from "lucide-react";

function NotificationsPage() {
  const { data: stats } = useDashboardStats();
  const s = stats as any;
  const [form, setForm] = useState({ title: "", body: "", type: "info", target: "all" });
  const [sent, setSent] = useState<{ title: string; target: string; sentAt: string }[]>([]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    // Store locally for now — will be connected to push/email service
    setSent(prev => [{ title: form.title, target: form.target, sentAt: new Date().toISOString() }, ...prev]);
    setForm({ title: "", body: "", type: "info", target: "all" });
  };

  return (
    <div>
      <PageHeader title="Notifications" description="Send broadcast notifications to platform users." />

      {/* Compose */}
      <form onSubmit={handleSend} className="rounded-xl border bg-card p-6 mb-6 space-y-4">
        <h3 className="font-semibold">Compose Notification</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Notification title *" required className="w-full" />
          <div className="flex gap-3">
            <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="flex-1">
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="alert">Alert</option>
            </Select>
            <Select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className="flex-1">
              <option value="all">All Users ({s?.totalUsers ?? 0})</option>
              <option value="sellers">Sellers ({s?.activeSellers ?? 0})</option>
              <option value="buyers">Buyers</option>
            </Select>
          </div>
        </div>
        <textarea
          rows={3}
          value={form.body}
          onChange={e => setForm({ ...form, body: e.target.value })}
          placeholder="Notification body *"
          required
          className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
        />
        <Button type="submit"><Send className="h-4 w-4" /> Send Notification</Button>
      </form>

      {/* Sent History */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-4">Sent History</h3>
        {sent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications sent this session. Sent notifications will be stored in the database once the notification service is integrated.</p>
        ) : (
          <div className="space-y-2">
            {sent.map((n, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-lg bg-muted/30 text-sm">
                <span className="font-medium flex-1">{n.title}</span>
                <span className="text-xs text-muted-foreground">To: {n.target}</span>
                <span className="text-xs text-muted-foreground">{new Date(n.sentAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-5 rounded-xl border bg-amber-50 border-amber-200 text-sm text-amber-800">
        <p className="font-semibold mb-1">Integration Status</p>
        <p>Notifications are currently stored in-session. To enable push notifications and email broadcasts, integrate a service like SendGrid or Firebase Cloud Messaging. The compose form and admin UI are production-ready.</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/notifications")({ component: NotificationsPage });
