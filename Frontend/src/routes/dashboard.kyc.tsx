import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Upload, User, Building2, CreditCard,
  CheckCircle2, AlertCircle, Loader2, Camera, FileText,
  Check, Clock, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { userAPI } from "@/lib/api-client";
import { useAuthContext } from "@/contexts/AuthContext";

export const Route = createFileRoute("/dashboard/kyc")({
  head: () => ({ meta: [{ title: "Account Verification — GhostBus" }] }),
  component: AccountVerificationPage,
});

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria",
  "Belgium", "Brazil", "Bulgaria", "Canada", "Chile", "China", "Colombia", "Croatia",
  "Czech Republic", "Denmark", "Egypt", "Estonia", "Finland", "France", "Georgia",
  "Germany", "Greece", "Hungary", "India", "Indonesia", "Ireland", "Israel", "Italy",
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Latvia", "Lithuania", "Luxembourg",
  "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway",
  "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Romania", "Russia",
  "Saudi Arabia", "Serbia", "Singapore", "Slovakia", "Slovenia", "South Africa",
  "South Korea", "Spain", "Sweden", "Switzerland", "Thailand", "Turkey", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Vietnam",
];

type FileUploadState = File | null;

function FileDropZone({
  label, hint, accept, file, onFile, icon
}: {
  label: string; hint: string; accept: string;
  file: FileUploadState; onFile: (f: File) => void; icon: React.ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      onClick={() => ref.current?.click()}
      className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
        dragging ? "border-primary bg-accent" :
        file ? "border-primary/50 bg-accent/40" :
        "border-border hover:border-primary/40 hover:bg-muted/50"
      }`}
    >
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
        file ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}>
        {file ? <Check className="w-5 h-5" /> : icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground truncate">
          {file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)` : hint}
        </div>
      </div>
    </div>
  );
}

function AccountVerificationPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const { user, refreshProfile } = useAuthContext();
  const navigate = useNavigate();

  // Auto-fill name from user profile
  const fullName = (user as any)?.fullName || '';
  const nameParts = fullName.split(' ');
  const [form, setForm] = useState({
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(' ') || "",
    address: "", zip: "", city: "", country: "",
    paypalEmail: (user as any)?.email || "", confirmed: false,
  });
  const [passportFile, setPassportFile] = useState<FileUploadState>(null);
  const [licenceFile, setLicenceFile] = useState<FileUploadState>(null);
  const [selfieFile, setSelfieFile] = useState<FileUploadState>(null);

  // Load current application status on mount
  const [statusLoading, setStatusLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<null | {
    applicationStatus: string | null;
    sellerVerified: boolean;
    sellerModeEnabled: boolean;
    kyc: { status: string; rejectionReason?: string; submittedAt: string } | null;
  }>(null);

  useEffect(() => {
    userAPI.getSellerApplicationStatus()
      .then((res: any) => setCurrentStatus(res.data?.data ?? res.data))
      .catch(() => {/* no application yet */})
      .finally(() => setStatusLoading(false));
  }, []);

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValid =
    form.firstName && form.lastName && form.address && form.zip &&
    form.city && form.country && form.paypalEmail &&
    passportFile && form.confirmed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) { toast.error("Please complete all required fields"); return; }
    setSubmitting(true);
    try {
      // Build FormData for KYC submission (multipart with passport file)
      const fd = new FormData();
      fd.append('documentType', 'Passport');
      fd.append('paypalEmail', form.paypalEmail);
      fd.append('firstName', form.firstName);
      fd.append('lastName', form.lastName);
      fd.append('address', form.address);
      fd.append('zip', form.zip);
      fd.append('city', form.city);
      fd.append('country', form.country);
      if (passportFile) fd.append('avatar', passportFile);

      await userAPI.submitKyc(fd);
      await refreshProfile();
      setSubmitted(true);
      toast.success("Verification submitted! Our team will review within 2–3 business days.");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to submit. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while fetching status
  if (statusLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Already KYC approved — show success
  if (currentStatus?.kyc?.status === 'APPROVED') {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto rounded-full bg-success/10 grid place-items-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-3">Verification Approved</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Your identity has been verified and your seller account is fully active. You can now upload and sell tracks on GhostBus.
        </p>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-[--color-primary-hover] transition"
        >
          Go to Seller Dashboard
        </button>
      </div>
    );
  }

  // Pending review — show waiting state
  if (currentStatus?.applicationStatus === 'pending') {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 grid place-items-center mb-6">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-3">Application Under Review</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          Your seller application has been submitted and is currently being reviewed by our team. This process typically takes 2–3 business days.
        </p>
        <p className="text-xs text-muted-foreground mb-8">You will receive an email notification once a decision has been made.</p>
        <div className="p-5 rounded-2xl bg-card border border-border text-left">
          <div className="label-eyebrow mb-3">What happens next?</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success shrink-0" /> Documents reviewed by our team</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success shrink-0" /> Payouts activated on approval</li>
            <li className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500 shrink-0" /> Seller mode enabled automatically on approval</li>
          </ul>
        </div>
      </div>
    );
  }

  // Rejected — show rejection reason and allow re-submission
  if (currentStatus?.applicationStatus === 'rejected') {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 grid place-items-center mb-6">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-3">Application Rejected</h2>
        {currentStatus.kyc?.rejectionReason && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 mb-6 text-left">
            <strong>Reason:</strong> {currentStatus.kyc.rejectionReason}
          </div>
        )}
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Please correct the issues above and resubmit your verification documents.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto rounded-full bg-success/10 grid place-items-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-3">Verification Submitted</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
          Your Account Verification documents have been submitted. Our team will review your submission within 2–3 business days.
          You will receive an email notification with the outcome.
        </p>
        <div className="mt-8 p-5 rounded-2xl bg-card border border-border max-w-sm mx-auto text-left">
          <div className="label-eyebrow mb-3">What happens next?</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success shrink-0" /> Documents reviewed by our team</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success shrink-0" /> Stripe Connect onboarding enabled</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success shrink-0" /> Payouts activated on approval</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="label-eyebrow">Seller Dashboard</div>
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Account Verification</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Complete identity verification to enable payouts. Required before you can receive earnings.
          Your information is encrypted and handled securely.
        </p>
      </div>

      {/* Status Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-8">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-amber-800">Verification Required</div>
          <div className="text-xs text-amber-700 mt-0.5">Payouts are disabled until Account Verification is approved.</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Core Identity */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Identity Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name *" placeholder="John" value={form.firstName} onChange={(v) => update("firstName", v)} />
            <Field label="Last Name *" placeholder="Doe" value={form.lastName} onChange={(v) => update("lastName", v)} />
          </div>
          <div className="mt-4 space-y-4">
            <Field label="Address *" placeholder="123 Main Street" value={form.address} onChange={(v) => update("address", v)} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="ZIP / Postal Code *" placeholder="10001" value={form.zip} onChange={(v) => update("zip", v)} />
              <Field label="City *" placeholder="New York" value={form.city} onChange={(v) => update("city", v)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1.5">Country *</label>
              <select
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm"
                required
              >
                <option value="">Select country...</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Section 2: Document Uploads */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Identity Documents</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Upload clear, legible photos or scans. Accepted: JPG, PNG, PDF. Max 10MB each.</p>
          <div className="space-y-3">
            <FileDropZone
              label="Passport or National ID *"
              hint="Upload a clear photo/scan of your passport or government-issued ID"
              accept=".jpg,.jpeg,.png,.pdf"
              file={passportFile}
              onFile={setPassportFile}
              icon={<FileText className="w-5 h-5" />}
            />
            <FileDropZone
              label="Driving Licence (optional)"
              hint="Upload your driving licence as additional verification"
              accept=".jpg,.jpeg,.png,.pdf"
              file={licenceFile}
              onFile={setLicenceFile}
              icon={<FileText className="w-5 h-5" />}
            />
            <FileDropZone
              label="Face Selfie (optional but recommended)"
              hint="Upload a clear selfie showing your face in good lighting"
              accept=".jpg,.jpeg,.png"
              file={selfieFile}
              onFile={setSelfieFile}
              icon={<Camera className="w-5 h-5" />}
            />
          </div>
        </section>

        {/* Section 3: Payout */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Payout Account</h2>
          </div>
          <Field
            label="PayPal Email Address *"
            placeholder="your@paypal.com"
            type="email"
            value={form.paypalEmail}
            onChange={(v) => update("paypalEmail", v)}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Earnings will be sent to this PayPal account. Make sure it matches your verified identity.
          </p>
        </section>

        {/* Confirmation */}
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-muted/30">
          <input
            id="confirm"
            type="checkbox"
            checked={form.confirmed}
            onChange={(e) => update("confirmed", e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary shrink-0"
            required
          />
          <label htmlFor="confirm" className="text-sm text-foreground/80 leading-relaxed cursor-pointer">
            I confirm that the information and documents I have provided are accurate, authentic, and belong to me.
            I understand that false documentation may result in permanent account suspension and legal action. *
          </label>
        </div>

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-[--color-primary-hover] transition shadow-[0_10px_30px_rgba(6,2,38,0.35)] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit for Verification"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text" }: {
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
        className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm"
      />
    </div>
  );
}
