import { createFileRoute } from "@tanstack/react-router";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Lock, Building2, Radio, ImageIcon, Smile,
  Eye, EyeOff, Loader2, CheckCircle2, Camera, LayoutTemplate,
} from "lucide-react";
import { toast } from "sonner";
import { useUpdateProfile, useChangePassword, useUploadAvatar, useUploadBanner } from "@/hooks/use-api";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — Dashboard" }] }),
  component: SellerAccountSettings,
});

const SECTIONS = [
  { id: "identity",  label: "Core Identity",     icon: User },
  { id: "security",  label: "Security",           icon: Lock },
  { id: "b2b",       label: "B2B Registry",       icon: Building2 },
  { id: "streaming", label: "Streaming Sync",     icon: Radio },
  { id: "bio",       label: "Bio & Photo",        icon: ImageIcon },
  { id: "banner",    label: "Profile Banner",     icon: LayoutTemplate },
  { id: "avatar",    label: "Avatar",             icon: Smile },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

const COUNTRY_CODES = [
  "+1", "+44", "+49", "+33", "+39", "+34", "+31", "+46",
  "+47", "+45", "+48", "+61", "+55", "+52", "+91", "+81",
  "+82", "+65", "+971", "+7", "+380", "+90",
];

function SellerAccountSettings() {
  const { user, profile, refreshProfile } = useAuthContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState<SectionId>("identity");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    (user as any)?.avatarUrl ?? (profile as any)?.avatar_url ?? null
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    (user as any)?.bannerUrl ?? null
  );

  const [form, setForm] = useState({
    // Identity
    firstName: "",
    lastName: "",
    countryCode: "+1",
    phone: "",
    username: "",
    displayName: "",
    // Security
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    // B2B
    companyName: "",
    vatId: "",
    facebook: "",
    instagram: "",
    soundcloud: "",
    spotify: "",
    // Streaming
    beatport: "",
    apple: "",
    youtube: "",
    // Bio
    bio: "",
  });

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const uploadAvatar = useUploadAvatar();
  const uploadBanner = useUploadBanner();

  // Sync form on auth load
  useEffect(() => {
    const fullName = (profile as any)?.full_name ?? (user as any)?.fullName ?? "";
    const parts = fullName.split(" ");
    setForm((prev) => ({
      ...prev,
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" ") ?? "",
      phone: (profile as any)?.phone ?? (user as any)?.phone ?? "",
      username: (profile as any)?.username ?? (user as any)?.username ?? "",
      displayName: fullName,
      bio: (profile as any)?.bio ?? (user as any)?.bio ?? "",
    }));
    const av = (user as any)?.avatarUrl ?? (profile as any)?.avatar_url;
    if (av) setAvatarPreview(av);
    const bn = (user as any)?.bannerUrl;
    if (bn) setBannerPreview(bn);
  }, [user, profile]);

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Save identity ──
  const handleIdentitySave = async () => {
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    if (fullName.length < 2) { toast.error("Full name must be at least 2 characters."); return; }
    try {
      await updateProfile.mutateAsync({
        fullName,
        username: form.username.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      await refreshProfile();
    } catch { /* toast in hook */ }
  };

  // ── Save security (password) ──
  const handlePasswordSave = async () => {
    const { currentPassword, newPassword, confirmPassword } = form;
    if (!currentPassword) { toast.error("Current password is required."); return; }
    if (newPassword.length < 8) { toast.error("New password must be at least 8 characters."); return; }
    if (!/[A-Za-z]/.test(newPassword)) { toast.error("Password must contain at least one letter."); return; }
    if (!/\d/.test(newPassword)) { toast.error("Password must contain at least one number."); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword, confirmPassword });
      update("currentPassword", "");
      update("newPassword", "");
      update("confirmPassword", "");
    } catch { /* toast in hook */ }
  };

  // ── Save bio / social links ──
  const handleBioSave = async () => {
    if (form.bio.length > 500) { toast.error("Bio cannot exceed 500 characters."); return; }
    try {
      await updateProfile.mutateAsync({ bio: form.bio });
      await refreshProfile();
    } catch { /* toast in hook */ }
  };

  // ── Avatar photo upload ──
  const handlePhotoSelect = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large. Maximum 5MB."); return; }
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP files are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const result = await uploadAvatar.mutateAsync(file);
      if (result?.avatarUrl) setAvatarPreview(result.avatarUrl);
      await refreshProfile();
    } catch { /* toast in hook */ }
  };

  // ── Banner image upload ──
  const handleBannerSelect = async (file: File) => {
    if (file.size > 3 * 1024 * 1024) { toast.error("File too large. Maximum 3MB."); return; }
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP files are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setBannerPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const result = await uploadBanner.mutateAsync(file);
      if (result?.bannerUrl) setBannerPreview(result.bannerUrl);
      await refreshProfile();
    } catch { /* toast in hook */ }
  };

  const passwordsMatch =
    form.confirmPassword.length === 0 ||
    form.newPassword === form.confirmPassword;

  const isIdentitySaving = updateProfile.isPending && active === "identity";
  const isBioSaving = updateProfile.isPending && active === "bio";
  const isPasswordSaving = changePassword.isPending;
  const isPhotoUploading = uploadAvatar.isPending;
  const isBannerUploading = uploadBanner.isPending;

  const displayInitial =
    (form.displayName || form.firstName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Account Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your identity, security, business info, and platform connections.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`shrink-0 h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition ${
              active === s.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground/70 hover:text-foreground hover:bg-accent"
            }`}
          >
            <s.icon className="w-4 h-4" />
            {s.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {/* ── Core Identity ── */}
          {active === "identity" && (
            <SectionCard
              title="Core Identity"
              desc="Your essential account information and contact details."
              onSave={handleIdentitySave}
              saving={isIdentitySaving}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <F label="First Name *" placeholder="John" value={form.firstName}
                  onChange={(v) => update("firstName", v)} />
                <F label="Last Name *" placeholder="Doe" value={form.lastName}
                  onChange={(v) => update("lastName", v)} />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/80 mb-1.5">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.countryCode}
                    onChange={(e) => update("countryCode", e.target.value)}
                    className="h-11 px-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 text-sm"
                  >
                    {COUNTRY_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value.replace(/[^\d\s\-().+]/g, ""))}
                    className="flex-1 h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <F label="Username" placeholder="your_username" value={form.username}
                  onChange={(v) => update("username", v)} />
                <F label="Display Name" placeholder="Your Public Name" value={form.displayName}
                  onChange={(v) => update("displayName", v)} />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/80 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    readOnly
                    className="w-full h-11 px-4 rounded-xl border border-border bg-muted text-foreground/60 text-sm cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                    Read-only
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Contact support to change your email address.
                </p>
              </div>
            </SectionCard>
          )}

          {/* ── Security ── */}
          {active === "security" && (
            <SectionCard
              title="Password & Security"
              desc="Update your password. Leave blank to keep your current password."
              onSave={handlePasswordSave}
              saving={isPasswordSaving}
            >
              <PwField
                label="Current Password"
                placeholder="Enter current password"
                value={form.currentPassword}
                onChange={(v) => update("currentPassword", v)}
                show={showCurrentPw}
                onToggle={() => setShowCurrentPw((s) => !s)}
              />
              <PwField
                label="New Password"
                placeholder="Minimum 8 characters"
                value={form.newPassword}
                onChange={(v) => update("newPassword", v)}
                show={showNewPw}
                onToggle={() => setShowNewPw((s) => !s)}
              />
              <F
                label="Confirm New Password"
                placeholder="Re-enter new password"
                type="password"
                value={form.confirmPassword}
                onChange={(v) => update("confirmPassword", v)}
              />
              {!passwordsMatch && (
                <p className="text-xs text-destructive">Passwords do not match.</p>
              )}

              <AnimatePresence>
                {form.newPassword.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <PasswordStrength password={form.newPassword} />
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>
          )}

          {/* ── B2B Registry ── */}
          {active === "b2b" && (
            <SectionCard
              title="B2B Corporate Registry"
              desc="Business details for invoices and label identification."
              onSave={() => toast.info("B2B settings saved locally. Backend integration coming soon.")}
              saving={false}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <F label="Artist Name" placeholder="Your label or company"
                  value={form.companyName} onChange={(v) => update("companyName", v)} />
                <F label="VAT ID / Tax Number" placeholder="e.g. DE123456789"
                  value={form.vatId} onChange={(v) => update("vatId", v)} />
              </div>

              <div className="label-eyebrow mt-2 mb-3 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                Social Media Links
              </div>
              <div className="space-y-3">
                <SocialField prefix="facebook.com/" label="Facebook"
                  value={form.facebook} onChange={(v) => update("facebook", v)} placeholder="yourpage" />
                <SocialField prefix="instagram.com/" label="Instagram"
                  value={form.instagram} onChange={(v) => update("instagram", v)} placeholder="yourhandle" />
                <SocialField prefix="soundcloud.com/" label="SoundCloud"
                  value={form.soundcloud} onChange={(v) => update("soundcloud", v)} placeholder="yourprofile" />
                <SocialField prefix="open.spotify.com/artist/" label="Spotify Artist"
                  value={form.spotify} onChange={(v) => update("spotify", v)} placeholder="artist ID" />
              </div>
            </SectionCard>
          )}

          {/* ── Streaming Sync ── */}
          {active === "streaming" && (
            <SectionCard
              title="Streaming Platform Sync"
              desc="Connect your external music profiles to verify industry credibility."
              onSave={() => toast.info("Streaming links saved locally. Backend integration coming soon.")}
              saving={false}
            >
              <div className="space-y-4">
                {([
                  { label: "Spotify Artist", prefix: "open.spotify.com/artist/", key: "spotify" },
                  { label: "Beatport Profile", prefix: "beatport.com/artist/", key: "beatport" },
                  { label: "Apple Music Artist", prefix: "music.apple.com/artist/", key: "apple" },
                  { label: "YouTube Channel", prefix: "youtube.com/", key: "youtube" },
                ] as const).map((item) => (
                  <div key={item.key}>
                    <label className="block text-xs font-medium text-foreground/80 mb-1.5">
                      {item.label}
                    </label>
                    <div className="flex items-center gap-0 rounded-xl border border-border overflow-hidden focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                      <span className="h-11 px-3 bg-muted text-xs text-muted-foreground flex items-center shrink-0 border-r border-border whitespace-nowrap">
                        {item.prefix}
                      </span>
                      <input
                        type="text"
                        placeholder="your-profile"
                        value={(form as any)[item.key]}
                        onChange={(e) => update(item.key, e.target.value)}
                        className="flex-1 h-11 px-3 bg-background focus:outline-none text-sm min-w-0"
                      />
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground">
                  Connected profiles help verify your industry presence and may improve your
                  visibility in the producer directory.
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── Bio & Photo ── */}
          {active === "bio" && (
            <SectionCard
              title="Bio & Profile Picture"
              desc="Tell the community about yourself. Keywords improve search visibility."
              onSave={handleBioSave}
              saving={isBioSaving}
            >
              <div>
                <label className="block text-xs font-medium text-foreground/80 mb-1.5">
                  About Me
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  rows={5}
                  maxLength={500}
                  placeholder="Elite EDM ghost producer specializing in Tech House and Afro House. Over 5 years of professional music production experience..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {form.bio.length}/500 characters. Use genre-specific keywords for better indexing.
                </p>
              </div>

              {/* Profile photo upload */}
              <div>
                <label className="block text-xs font-medium text-foreground/80 mb-3">
                  Profile Picture
                </label>
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
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Upload profile picture"
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) handlePhotoSelect(file);
                  }}
                >
                  <div className="relative shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview"
                        className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted grid place-items-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    {isPhotoUploading && (
                      <div className="absolute inset-0 rounded-full bg-black/50 grid place-items-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {avatarPreview ? "Change profile picture" : "Upload profile picture"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      JPG, PNG, or WebP · Max 5 MB · Drag & drop or click
                    </p>
                    {isPhotoUploading && (
                      <p className="text-xs text-primary mt-1">Uploading…</p>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── Profile Banner ── */}
          {active === "banner" && (
            <SectionCard
              title="Profile Banner"
              desc="Banner image shown at the top of your public artist profile page. Recommended: 1500×400px, JPG or PNG."
              saveLabel="Upload Banner"
              onSave={() => {}}
              saving={false}
            >
              {/* Current banner preview */}
              <div
                className="w-full rounded-xl overflow-hidden mb-5 flex items-center justify-center"
                style={{ height: 180 }}
              >
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #060226 0%, #0d0540 50%, #1a0f8f 100%)" }}
                  >
                    <p className="text-white/50 text-sm">No banner yet — upload one below</p>
                  </div>
                )}
              </div>

              <input
                ref={bannerRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleBannerSelect(f);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={isBannerUploading}
                onClick={() => bannerRef.current?.click()}
                className="h-10 px-5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isBannerUploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                ) : (
                  <><Camera className="w-4 h-4" /> {bannerPreview ? "Replace Banner" : "Upload Banner"}</>
                )}
              </button>
              <p className="text-xs text-muted-foreground mt-3">
                JPG, PNG, or WebP · Max 3MB · Recommended 1500×400px
              </p>
            </SectionCard>
          )}

          {/* ── Avatar ── */}
          {active === "avatar" && (
            <SectionCard
              title="Avatar"
              desc="Your public avatar shown on track listings and the marketplace."
              saveLabel="Upload Photo"
              onSave={() => setActive("bio")}
              saving={false}
            >
              <div className="flex items-start gap-6">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-2xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#060226] to-[#1a0a5e] grid place-items-center text-white text-3xl font-bold shrink-0">
                    {displayInitial}
                  </div>
                )}
                <div>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                    {avatarPreview
                      ? "Your custom profile picture is active. You can update it in Bio & Photo."
                      : "Your avatar is automatically generated from your initials. Upload a profile picture in Bio & Photo to use a custom image."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActive("bio")}
                    className="h-9 px-4 rounded-full border border-border text-sm font-medium hover:bg-muted transition inline-flex items-center gap-2"
                  >
                    <Camera className="w-3.5 h-3.5" /> Go to Bio & Photo
                  </button>
                </div>
              </div>
            </SectionCard>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  title, desc, children, onSave, saving, saveLabel = "Save Changes",
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
  saveLabel?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
      </div>
      {children}
      <div className="pt-2 border-t border-border">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-[--color-primary-hover] transition shadow-[0_10px_30px_rgba(6,2,38,0.35)] disabled:opacity-60 inline-flex items-center gap-2"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : saveLabel}
        </button>
      </div>
    </div>
  );
}

function F({
  label, placeholder, value, onChange, type = "text",
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground/80 mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm transition"
      />
    </div>
  );
}

function PwField({
  label, placeholder, value, onChange, show, onToggle,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; show: boolean; onToggle: () => void;
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
          className="w-full h-11 px-4 pr-11 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm transition"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function SocialField({
  prefix, label, value, onChange, placeholder,
}: {
  prefix: string; label: string; value: string;
  onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground/80 mb-1.5">{label}</label>
      <div className="flex items-center gap-0 rounded-xl border border-border overflow-hidden focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
        <span className="h-11 px-3 bg-muted text-xs text-muted-foreground flex items-center shrink-0 border-r border-border whitespace-nowrap">
          {prefix}
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-11 px-3 bg-background focus:outline-none text-sm min-w-0"
        />
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", pass: password.length >= 8 },
    { label: "Letter", pass: /[A-Za-z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
  ];
  const passed = checks.filter((c) => c.pass).length;
  const color =
    passed <= 1 ? "bg-destructive" : passed === 2 ? "bg-amber-500" : "bg-emerald-500";
  const label = passed <= 1 ? "Weak" : passed === 2 ? "Good" : "Strong";

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {checks.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i < passed ? color : "bg-muted"}`}
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
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
