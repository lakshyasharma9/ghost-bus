import { createFileRoute } from "@tanstack/react-router";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Eye, EyeOff, Loader2, CheckCircle2, User,
} from "lucide-react";
import { toast } from "sonner";
import { useUpdateProfile, useChangePassword, useUploadAvatar } from "@/hooks/use-api";

export const Route = createFileRoute("/account/profile")({
  component: BuyerAccountSettings,
});

function BuyerAccountSettings() {
  const { user, profile, refreshProfile } = useAuthContext();
  const fileRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    (user as any)?.avatarUrl ?? (profile as any)?.avatar_url ?? null
  );

  const [profileForm, setProfileForm] = useState({
    fullName: (profile as any)?.full_name ?? (user as any)?.fullName ?? "",
    email: user?.email ?? "",
    phone: (profile as any)?.phone ?? (user as any)?.phone ?? "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const uploadAvatar = useUploadAvatar();

  // Sync form when profile loads
  useEffect(() => {
    setProfileForm({
      fullName: (profile as any)?.full_name ?? (user as any)?.fullName ?? "",
      email: user?.email ?? "",
      phone: (profile as any)?.phone ?? (user as any)?.phone ?? "",
    });
    const av = (user as any)?.avatarUrl ?? (profile as any)?.avatar_url;
    if (av) setAvatarPreview(av);
  }, [user, profile]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = profileForm.fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      toast.error("Full name must be at least 2 characters.");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        fullName: trimmedName,
        phone: profileForm.phone.trim() || undefined,
      });
      await refreshProfile();
    } catch {
      // error toast handled in hook
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword) { toast.error("Current password is required."); return; }
    if (newPassword.length < 8) { toast.error("New password must be at least 8 characters."); return; }
    if (!/[A-Za-z]/.test(newPassword)) { toast.error("New password must contain at least one letter."); return; }
    if (!/\d/.test(newPassword)) { toast.error("New password must contain at least one number."); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword, confirmPassword });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      // error toast handled in hook
    }
  };

  const handlePhotoSelect = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP files are supported.");
      return;
    }
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    // Upload
    try {
      const result = await uploadAvatar.mutateAsync(file);
      if (result?.avatarUrl) setAvatarPreview(result.avatarUrl);
      await refreshProfile();
    } catch {
      // error toast handled in hook
    }
  };

  const initials =
    profileForm.fullName
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || user?.email?.[0]?.toUpperCase() || "U";

  const isSavingProfile = updateProfile.isPending;
  const isSavingPassword = changePassword.isPending;
  const isUploadingPhoto = uploadAvatar.isPending;

  const passwordsMatch =
    passwordForm.confirmPassword.length === 0 ||
    passwordForm.newPassword === passwordForm.confirmPassword;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold mb-1">Account Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your name, email, phone number, profile photo, and password.
        </p>
      </div>

      {/* ── Profile Photo ── */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-1">Profile Photo</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Your photo is shown on your profile and orders.
        </p>
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#060226] to-[#1a0a5e] grid place-items-center text-white text-2xl font-bold">
                {initials}
              </div>
            )}
            {isUploadingPhoto && (
              <div className="absolute inset-0 rounded-full bg-black/50 grid place-items-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>

          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePhotoSelect(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={isUploadingPhoto}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-border text-sm font-medium hover:bg-muted transition disabled:opacity-60"
            >
              <Camera className="w-4 h-4" />
              {isUploadingPhoto ? "Uploading…" : "Upload Photo"}
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG, or WebP · Max 5 MB
            </p>
          </div>
        </div>
      </div>

      {/* ── Basic Info ── */}
      <form onSubmit={handleProfileSave} className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold mb-1">Basic Information</h2>
          <p className="text-sm text-muted-foreground">Update your display name and contact details.</p>
        </div>

        <Field
          label="Full Name"
          required
          placeholder="Jane Doe"
          value={profileForm.fullName}
          onChange={(v) => setProfileForm((p) => ({ ...p, fullName: v }))}
        />

        {/* Email — read-only for now */}
        <div>
          <label className="block text-xs font-medium text-foreground/80 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={profileForm.email}
              readOnly
              className="w-full h-11 px-4 rounded-xl border border-border bg-muted text-foreground/60 text-sm cursor-not-allowed select-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
              Read-only
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Contact support to change your email address.
          </p>
        </div>

        <Field
          label="Phone Number"
          placeholder="+1 555 000 0000"
          type="tel"
          value={profileForm.phone}
          onChange={(v) => setProfileForm((p) => ({ ...p, phone: v }))}
        />

        <div className="pt-1">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="h-11 px-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-[--color-primary-hover] transition shadow-[0_8px_24px_rgba(6,2,38,0.30)] disabled:opacity-60 inline-flex items-center gap-2"
          >
            {isSavingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save Changes"}
          </button>
        </div>
      </form>

      {/* ── Change Password ── */}
      <form onSubmit={handlePasswordSave} className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold mb-1">Change Password</h2>
          <p className="text-sm text-muted-foreground">
            Use a strong password with at least 8 characters including letters and numbers.
          </p>
        </div>

        <PasswordField
          label="Current Password"
          placeholder="Enter your current password"
          value={passwordForm.currentPassword}
          onChange={(v) => setPasswordForm((p) => ({ ...p, currentPassword: v }))}
          show={showCurrentPw}
          onToggle={() => setShowCurrentPw((s) => !s)}
        />

        <PasswordField
          label="New Password"
          placeholder="Minimum 8 characters"
          value={passwordForm.newPassword}
          onChange={(v) => setPasswordForm((p) => ({ ...p, newPassword: v }))}
          show={showNewPw}
          onToggle={() => setShowNewPw((s) => !s)}
        />

        <PasswordField
          label="Confirm New Password"
          placeholder="Re-enter your new password"
          value={passwordForm.confirmPassword}
          onChange={(v) => setPasswordForm((p) => ({ ...p, confirmPassword: v }))}
          show={showConfirmPw}
          onToggle={() => setShowConfirmPw((s) => !s)}
          error={!passwordsMatch ? "Passwords do not match" : undefined}
        />

        {/* Strength indicator */}
        <AnimatePresence>
          {passwordForm.newPassword.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <PasswordStrength password={passwordForm.newPassword} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-1">
          <button
            type="submit"
            disabled={isSavingPassword || !passwordsMatch}
            className="h-11 px-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-[--color-primary-hover] transition shadow-[0_8px_24px_rgba(6,2,38,0.30)] disabled:opacity-60 inline-flex items-center gap-2"
          >
            {isSavingPassword ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, placeholder, value, onChange, type = "text", required,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground/80 mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm transition"
      />
    </div>
  );
}

function PasswordField({
  label, placeholder, value, onChange, show, onToggle, error,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; show: boolean; onToggle: () => void; error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground/80 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-11 px-4 pr-11 rounded-xl border bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm transition ${
            error ? "border-destructive focus:border-destructive" : "border-border focus:border-primary/40"
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Contains a letter", pass: /[A-Za-z]/.test(password) },
    { label: "Contains a number", pass: /\d/.test(password) },
  ];
  const passed = checks.filter((c) => c.pass).length;
  const strength = passed === 0 ? "Weak" : passed === 1 ? "Fair" : passed === 2 ? "Good" : "Strong";
  const color = passed <= 1 ? "bg-destructive" : passed === 2 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {checks.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < passed ? color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`flex items-center gap-1 text-xs ${
                c.pass ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
              }`}
            >
              <CheckCircle2 className={`w-3 h-3 ${c.pass ? "opacity-100" : "opacity-30"}`} />
              {c.label}
            </span>
          ))}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{strength}</span>
      </div>
    </div>
  );
}
