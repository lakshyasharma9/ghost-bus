import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ShieldCheck, Upload, CheckCircle2, Clock, AlertCircle, User, CreditCard, FileText, Loader2 } from "lucide-react";
import { useMyKYC, useSubmitKYC, uploadFile } from "@/hooks/use-api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/kyc")({
  head: () => ({ meta: [{ title: "KYC Verification — Dashboard" }] }),
  component: DashboardKYC,
});

const STEPS = [
  { id: "identity", icon: <User className="w-5 h-5" />, label: "Identity", desc: "Government-issued ID" },
  { id: "address", icon: <FileText className="w-5 h-5" />, label: "Address", desc: "Proof of address" },
  { id: "payment", icon: <CreditCard className="w-5 h-5" />, label: "Payout", desc: "Bank or PayPal details" },
];

function DashboardKYC() {
  const { data: kycRaw, isLoading } = useMyKYC();
  const kyc = kycRaw as any;
  const submitKYC = useSubmitKYC();

  const [activeStep, setActiveStep] = useState(0);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [payoutEmail, setPayoutEmail] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!idFile || !addressFile || !payoutEmail) {
      toast.error("Please complete all steps before submitting.");
      return;
    }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const [idUrl, addressUrl] = await Promise.all([
        uploadFile("tracks", `kyc/${user.id}/id.${idFile.name.split(".").pop()}`, idFile),
        uploadFile("tracks", `kyc/${user.id}/address.${addressFile.name.split(".").pop()}`, addressFile),
      ]);

      await submitKYC.mutateAsync({ id_document_url: idUrl, address_document_url: addressUrl, payout_email: payoutEmail });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (kyc?.status === "approved") {
    return (
      <div className="max-w-lg">
        <div className="mb-8"><div className="label-eyebrow mb-2">KYC</div><h1 className="font-display text-3xl font-semibold tracking-tight">Identity Verification</h1></div>
        <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="font-semibold text-lg text-emerald-800">Verified ✅</h2>
          <p className="text-sm text-emerald-700 mt-2">Your identity has been verified. You can now withdraw earnings and access all seller features.</p>
          <div className="mt-4 text-xs text-emerald-600">Payout: {kyc.payout_method} · {kyc.payout_email}</div>
        </div>
      </div>
    );
  }

  if (kyc?.status === "pending") {
    return (
      <div className="max-w-lg">
        <div className="mb-8"><div className="label-eyebrow mb-2">KYC</div><h1 className="font-display text-3xl font-semibold tracking-tight">Identity Verification</h1></div>
        <div className="p-8 rounded-2xl bg-amber-50 border border-amber-200 text-center">
          <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="font-semibold text-lg text-amber-800">Under Review</h2>
          <p className="text-sm text-amber-700 mt-2">Your documents are being reviewed. This typically takes 1–2 business days.</p>
        </div>
        <div className="mt-6 p-5 rounded-2xl bg-card border border-border">
          <div className="label-eyebrow mb-3">Submitted Documents</div>
          <ul className="space-y-2 text-sm">
            {kyc.id_document_url && <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Government ID uploaded</li>}
            {kyc.address_document_url && <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Proof of address uploaded</li>}
            {kyc.payout_email && <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Payout: {kyc.payout_email}</li>}
          </ul>
        </div>
      </div>
    );
  }

  if (kyc?.status === "rejected") {
    return (
      <div className="max-w-lg">
        <div className="mb-8"><div className="label-eyebrow mb-2">KYC</div><h1 className="font-display text-3xl font-semibold tracking-tight">Identity Verification</h1></div>
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 mb-6">
          <h2 className="font-semibold text-red-800 mb-1">KYC Rejected</h2>
          <p className="text-sm text-red-700">Reason: {kyc.rejection_reason ?? "Please resubmit with clearer documents."}</p>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Please resubmit your documents below.</p>
        <KYCForm activeStep={activeStep} setActiveStep={setActiveStep} idFile={idFile} setIdFile={setIdFile} addressFile={addressFile} setAddressFile={setAddressFile} payoutEmail={payoutEmail} setPayoutEmail={setPayoutEmail} onSubmit={handleSubmit} uploading={uploading || submitKYC.isPending} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <div className="label-eyebrow mb-2">KYC</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Identity Verification</h1>
        <p className="text-muted-foreground mt-1.5">Required to withdraw earnings and comply with financial regulations.</p>
      </div>
      <div className="p-5 rounded-2xl bg-accent border border-primary/20 flex items-start gap-3 mb-8">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <div className="font-medium text-sm">Why do we need this?</div>
          <p className="text-xs text-muted-foreground mt-1">KYC is required by financial regulations to prevent fraud and ensure secure payouts. Your data is encrypted and never shared.</p>
        </div>
      </div>
      <KYCForm activeStep={activeStep} setActiveStep={setActiveStep} idFile={idFile} setIdFile={setIdFile} addressFile={addressFile} setAddressFile={setAddressFile} payoutEmail={payoutEmail} setPayoutEmail={setPayoutEmail} onSubmit={handleSubmit} uploading={uploading || submitKYC.isPending} />
    </div>
  );
}

function KYCForm({ activeStep, setActiveStep, idFile, setIdFile, addressFile, setAddressFile, payoutEmail, setPayoutEmail, onSubmit, uploading }: any) {
  return (
    <>
      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => {
          const done = (i === 0 && idFile) || (i === 1 && addressFile) || (i === 2 && payoutEmail);
          return (
            <button key={s.id} onClick={() => setActiveStep(i)} className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${activeStep === i ? "border-primary bg-accent" : done ? "border-emerald-200 bg-emerald-50" : "border-border hover:border-primary/40"}`}>
              <div className={`w-8 h-8 rounded-xl grid place-items-center mb-2 ${done ? "bg-emerald-100 text-emerald-600" : activeStep === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
              </div>
              <div className="text-sm font-semibold">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </button>
          );
        })}
      </div>

      {activeStep === 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold">Government-Issued ID</h2>
          <p className="text-sm text-muted-foreground">Upload a clear photo of your passport, national ID, or driver's license.</p>
          <FileUploadBox label="ID Document" accept=".jpg,.jpeg,.png,.pdf" file={idFile} onFile={setIdFile} />
          <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">Accepted: Passport, National ID, Driver's License. File must be clear and unedited.</p>
          </div>
          <button onClick={() => setActiveStep(1)} disabled={!idFile} className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40">Continue →</button>
        </div>
      )}

      {activeStep === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold">Proof of Address</h2>
          <p className="text-sm text-muted-foreground">Upload a utility bill, bank statement, or official letter dated within the last 3 months.</p>
          <FileUploadBox label="Address Document" accept=".jpg,.jpeg,.png,.pdf" file={addressFile} onFile={setAddressFile} />
          <div className="flex gap-3">
            <button onClick={() => setActiveStep(0)} className="h-10 px-5 rounded-full border border-border text-sm font-medium">← Back</button>
            <button onClick={() => setActiveStep(2)} disabled={!addressFile} className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40">Continue →</button>
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-4">
          <h2 className="font-semibold">Payout Details</h2>
          <p className="text-sm text-muted-foreground">Enter your PayPal email for receiving payments.</p>
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1.5">PayPal Email *</label>
            <input type="email" placeholder="your@paypal.com" value={payoutEmail} onChange={(e) => setPayoutEmail(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm" />
          </div>
          <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">Payouts processed within 2–3 business days. Minimum withdrawal: $50.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActiveStep(1)} className="h-10 px-5 rounded-full border border-border text-sm font-medium">← Back</button>
            <button onClick={onSubmit} disabled={!payoutEmail || uploading} className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 inline-flex items-center gap-2">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : "Submit for Review"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function FileUploadBox({ label, accept, file, onFile }: { label: string; accept: string; file: File | null; onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      onClick={() => inputRef.current?.click()}
      className={`p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all text-center ${dragging ? "border-primary bg-accent" : file ? "border-primary/40 bg-accent/50" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {file ? (
        <>
          <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="font-medium text-sm">{file.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Click to replace</div>
        </>
      ) : (
        <>
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-muted-foreground mt-1">Click or drag to upload · {accept}</div>
        </>
      )}
    </div>
  );
}
