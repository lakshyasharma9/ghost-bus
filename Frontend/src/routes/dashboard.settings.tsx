import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/use-api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — Dashboard" }] }),
  component: DashboardSettings,
});

function DashboardSettings() {
  const { data: profileRaw, isLoading } = useProfile();
  const profile = profileRaw as any;
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({ display_name: "", bio: "", website: "", instagram: "", soundcloud: "" });
  const [notifications, setNotifications] = useState({ sales: true, messages: true, reviews: true, marketing: false });
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? "",
        bio: profile.bio ?? "",
        website: profile.website ?? "",
        instagram: profile.instagram ?? "",
        soundcloud: profile.soundcloud ?? "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate(form);
  };

  const handlePasswordChange = async () => {
    if (passwords.next !== passwords.confirm) { toast.error("Passwords do not match."); return; }
    if (passwords.next.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.next });
    setChangingPw(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated!"); setPasswords({ current: "", next: "", confirm: "" }); }
  };

  if (isLoading) return <div className="py-20 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <div className="label-eyebrow mb-2">Settings</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Account Settings</h1>
      </div>

      <Section title="Profile">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-white text-xl font-semibold shrink-0">
              {(form.display_name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <button className="h-9 px-4 rounded-full border border-border text-sm font-medium hover:bg-muted transition">Change Avatar</button>
              <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG or GIF · Max 2MB</p>
            </div>
          </div>
          <Field label="Display Name" value={form.display_name} onChange={(v) => setForm({ ...form, display_name: v })} placeholder="Your producer name" />
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell buyers about yourself and your production style..." rows={3} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm resize-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} placeholder="https://yoursite.com" />
            <Field label="Instagram" value={form.instagram} onChange={(v) => setForm({ ...form, instagram: v })} placeholder="@yourhandle" />
          </div>
          <Field label="SoundCloud" value={form.soundcloud} onChange={(v) => setForm({ ...form, soundcloud: v })} placeholder="soundcloud.com/yourprofile" />
        </div>
      </Section>

      <Section title="Notifications">
        <div className="space-y-4">
          {[
            { key: "sales" as const, label: "Sale notifications", desc: "Get notified when a track sells" },
            { key: "messages" as const, label: "New messages", desc: "Receive email for new buyer messages" },
            { key: "reviews" as const, label: "A&R review updates", desc: "Track submission status changes" },
            { key: "marketing" as const, label: "Marketing emails", desc: "Tips, updates, and platform news" },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">{n.label}</div>
                <div className="text-xs text-muted-foreground">{n.desc}</div>
              </div>
              <button onClick={() => setNotifications({ ...notifications, [n.key]: !notifications[n.key] })} className={`relative w-11 h-6 rounded-full transition-colors ${notifications[n.key] ? "bg-primary" : "bg-muted"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications[n.key] ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Security">
        <div className="space-y-4">
          <Field label="New Password" value={passwords.next} onChange={(v) => setPasswords({ ...passwords, next: v })} placeholder="••••••••" type="password" />
          <Field label="Confirm Password" value={passwords.confirm} onChange={(v) => setPasswords({ ...passwords, confirm: v })} placeholder="••••••••" type="password" />
          <button onClick={handlePasswordChange} disabled={changingPw || !passwords.next} className="h-10 px-5 rounded-full border border-border text-sm font-medium hover:bg-muted transition disabled:opacity-40 inline-flex items-center gap-2">
            {changingPw ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Update Password"}
          </button>
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={updateProfile.isPending} className="h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-[0_8px_24px_rgba(10,132,255,0.28)] disabled:opacity-60 transition inline-flex items-center gap-2">
          {updateProfile.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
        </button>
      </div>

      <Section title="Danger Zone">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">These actions are irreversible. Please proceed with caution.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => toast.error("Contact support to deactivate your account.")} className="h-10 px-5 rounded-full border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/5 transition">Deactivate Account</button>
            <button onClick={() => toast.error("Contact support to delete your account.")} className="h-10 px-5 rounded-full bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition">Delete Account</button>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border">
      <h2 className="font-semibold mb-5">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground/80 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm" />
    </div>
  );
}
