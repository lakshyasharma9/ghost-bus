import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Upload, FileAudio, FileArchive, Image, ShieldCheck, DollarSign, Loader2, AlertCircle, Music2 } from "lucide-react";
import { toast } from "sonner";
import { GENRES } from "@/lib/mock-data";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Upload Track — GhostBus" }] }),
  component: UploadPage,
});

const STEPS = ["Metadata", "Files", "Transparency", "Pricing", "Verification"];
const KEYS = ["A min", "A maj", "B min", "B maj", "C min", "C maj", "D min", "D maj", "E min", "E maj", "F min", "F maj", "F# min", "F# maj", "G min", "G maj", "Bb min", "Bb maj"];

type FileSlot = { label: string; key: string; accept: string; icon: React.ReactNode; required: boolean };
const FILE_SLOTS: FileSlot[] = [
  { label: "Mastered WAV", key: "mastered", accept: ".wav", icon: <FileAudio className="w-5 h-5" />, required: true },
  { label: "Unmastered WAV", key: "unmastered", accept: ".wav", icon: <FileAudio className="w-5 h-5" />, required: true },
  { label: "Stems ZIP", key: "stems", accept: ".zip", icon: <FileArchive className="w-5 h-5" />, required: true },
  { label: "MIDI ZIP", key: "midi", accept: ".zip", icon: <FileArchive className="w-5 h-5" />, required: false },
  { label: "Artwork (3000×3000)", key: "artwork", accept: ".jpg,.jpeg,.png", icon: <Image className="w-5 h-5" />, required: true },
];

function UploadPage() {
  const [step, setStep] = useState(0);
  const [meta, setMeta] = useState({ title: "", genre: "", bpm: "", key: "", description: "" });
  const [files, setFiles] = useState<Record<string, File | null>>({ mastered: null, unmastered: null, stems: null, midi: null, artwork: null });
  const [transparency, setTransparency] = useState<"original" | "loops" | null>(null);
  const [price, setPrice] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const canNext = () => {
    if (step === 0) return meta.title && meta.genre && meta.bpm && meta.key && meta.description;
    if (step === 1) return FILE_SLOTS.filter((s) => s.required).every((s) => files[s.key]);
    if (step === 2) return transparency !== null;
    if (step === 3) return price && parseInt(price) >= 199 && parseInt(price) <= 2000;
    return true;
  };

  const next = () => {
    if (!canNext()) { toast.error("Please complete all required fields"); return; }
    if (step === 4) {
      setVerifying(true);
      setTimeout(() => { setVerifying(false); setVerified(true); toast.success("Track submitted for A&R review!"); }, 3000);
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="container-app pt-12 pb-24 max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="label-eyebrow mb-2">Seller Dashboard</div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Upload a Track</h1>
        <p className="text-muted-foreground mt-2">Complete all 5 steps to submit your track for A&R review.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-12">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 shrink-0 ${i < step ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className={`w-9 h-9 rounded-full grid place-items-center text-sm font-semibold transition-all ${
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-foreground text-background" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 transition-colors ${i < step ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && <StepMetadata meta={meta} setMeta={setMeta} />}
          {step === 1 && <StepFiles files={files} setFiles={setFiles} />}
          {step === 2 && <StepTransparency value={transparency} onChange={setTransparency} />}
          {step === 3 && <StepPricing price={price} setPrice={setPrice} />}
          {step === 4 && <StepVerification verifying={verifying} verified={verified} files={files} meta={meta} />}
        </motion.div>
      </AnimatePresence>

      {!verified && (
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="h-11 px-5 rounded-full border border-border text-sm font-medium disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={verifying}
            className="h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2 shadow-[0_10px_30px_rgba(10,132,255,0.28)] disabled:opacity-60"
          >
            {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> :
             step === 4 ? "Submit for Review" :
             <>Next <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      )}
    </div>
  );
}

function StepMetadata({ meta, setMeta }: { meta: any; setMeta: any }) {
  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-xl">Step 1 — Track Metadata</h2>
      <Field label="Track Title *" placeholder="e.g. Midnight Protocol" value={meta.title} onChange={(v) => setMeta({ ...meta, title: v })} />
      <div>
        <label className="block text-xs font-medium text-foreground/80 mb-1.5">Genre *</label>
        <select
          value={meta.genre}
          onChange={(e) => setMeta({ ...meta, genre: e.target.value })}
          className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm"
        >
          <option value="">Select genre...</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="BPM *" placeholder="e.g. 128" type="number" value={meta.bpm} onChange={(v) => setMeta({ ...meta, bpm: v })} />
        <div>
          <label className="block text-xs font-medium text-foreground/80 mb-1.5">Musical Key *</label>
          <select
            value={meta.key}
            onChange={(e) => setMeta({ ...meta, key: e.target.value })}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm"
          >
            <option value="">Select key...</option>
            {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-foreground/80 mb-1.5">Description *</label>
        <textarea
          value={meta.description}
          onChange={(e) => setMeta({ ...meta, description: e.target.value })}
          placeholder="Describe your track, its vibe, influences, and what makes it unique..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm resize-none"
        />
      </div>
    </div>
  );
}

function StepFiles({ files, setFiles }: { files: Record<string, File | null>; setFiles: any }) {
  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-xl">Step 2 — File Uploads</h2>
      <p className="text-sm text-muted-foreground">Upload all required files. Files are stored securely and never shared publicly.</p>
      <div className="space-y-3">
        {FILE_SLOTS.map((slot) => (
          <FileDropZone
            key={slot.key}
            slot={slot}
            file={files[slot.key]}
            onFile={(f) => setFiles({ ...files, [slot.key]: f })}
          />
        ))}
      </div>
    </div>
  );
}

function FileDropZone({ slot, file, onFile }: { slot: FileSlot; file: File | null; onFile: (f: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
        dragging ? "border-primary bg-accent" :
        file ? "border-primary/40 bg-accent/50" :
        "border-border hover:border-primary/40 hover:bg-muted/50"
      }`}
    >
      <input ref={inputRef} type="file" accept={slot.accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${file ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        {file ? <Check className="w-5 h-5" /> : slot.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{slot.label} {slot.required && <span className="text-destructive">*</span>}</div>
        <div className="text-xs text-muted-foreground truncate">{file ? file.name : `Click or drag to upload · ${slot.accept}`}</div>
      </div>
      {file && <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024 / 1024).toFixed(1)} MB</span>}
    </div>
  );
}

function StepTransparency({ value, onChange }: { value: "original" | "loops" | null; onChange: (v: "original" | "loops") => void }) {
  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-xl">Step 3 — Transparency Declaration</h2>
      <p className="text-sm text-muted-foreground">Buyers deserve to know what they're purchasing. Please declare the origin of your track honestly.</p>
      <div className="space-y-3">
        <button
          onClick={() => onChange("original")}
          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${value === "original" ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${value === "original" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">100% Original Production</div>
              <p className="text-sm text-muted-foreground mt-1">Every element in this track was created from scratch by me. No third-party loops, samples, or presets from sample packs were used.</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => onChange("loops")}
          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${value === "loops" ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${value === "loops" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">Contains Royalty-Free Loops</div>
              <p className="text-sm text-muted-foreground mt-1">This track uses royalty-free loops or samples from licensed sample packs. All elements are cleared for commercial use and rights transfer.</p>
            </div>
          </div>
        </button>
      </div>
      <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">False declarations may result in account suspension and legal liability. Our A&R team verifies all submissions.</p>
      </div>
    </div>
  );
}

function StepPricing({ price, setPrice }: { price: string; setPrice: (v: string) => void }) {
  const PRESETS = [299, 399, 499, 599, 749, 999];
  const num = parseInt(price) || 0;
  const platform = Math.round(num * 0.15);
  const payout = num - platform;

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-xl">Step 4 — Set Your Price</h2>
      <p className="text-sm text-muted-foreground">Set a price between $199 and $2,000. GhostBus takes a 15% platform fee.</p>
      <div>
        <label className="block text-xs font-medium text-foreground/80 mb-1.5">Price (USD) *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
          <input
            type="number"
            min={199}
            max={2000}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="499"
            className="w-full h-14 pl-8 pr-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-2xl font-semibold"
          />
        </div>
        {price && (num < 199 || num > 2000) && (
          <p className="text-xs text-destructive mt-1.5">Price must be between $199 and $2,000</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setPrice(String(p))}
            className={`h-9 px-4 rounded-full text-sm font-medium border transition ${price === String(p) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}
          >
            ${p}
          </button>
        ))}
      </div>
      {price && num >= 199 && num <= 2000 && (
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="label-eyebrow">Earnings Breakdown</div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Track price</span><span className="font-medium">${num}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Platform fee (15%)</span><span className="text-muted-foreground">-${platform}</span></div>
          <div className="flex justify-between font-semibold border-t border-border pt-3"><span>Your payout</span><span className="text-primary text-lg">${payout}</span></div>
        </div>
      )}
    </div>
  );
}

function StepVerification({ verifying, verified, files, meta }: { verifying: boolean; verified: boolean; files: Record<string, File | null>; meta: any }) {
  const checks = [
    { label: "ZIP file structure validation", done: !verifying },
    { label: "Audio quality check (min 24-bit WAV)", done: !verifying },
    { label: "Artwork resolution check (3000×3000)", done: !verifying },
    { label: "Uniqueness scan (plagiarism detection)", done: !verifying },
    { label: "Metadata completeness check", done: !verifying },
  ];

  if (verified) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 grid place-items-center mb-6">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-semibold">Track Submitted!</h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">Your track "{meta.title}" has been submitted for A&R review. You'll receive an email within 48 hours with the decision.</p>
        <div className="mt-8 p-5 rounded-2xl bg-card border border-border text-left max-w-sm mx-auto">
          <div className="label-eyebrow mb-3">What happens next?</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> A&R team reviews your track</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Watermarked preview generated</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Track goes live on marketplace</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Instant payout on sale</li>
          </ul>
        </div>
        <Link to="/dashboard" className="mt-8 inline-flex h-11 px-6 items-center rounded-full bg-primary text-primary-foreground font-medium">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-xl">Step 5 — Verification</h2>
      <p className="text-sm text-muted-foreground">Before submission, we run automated checks on your files. After passing, your track enters the A&R review queue.</p>
      <div className="space-y-3">
        {checks.map((c, i) => (
          <div key={c.label} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${verifying ? "bg-muted" : "bg-primary/10"}`}>
              {verifying ? (
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" style={{ animationDelay: `${i * 0.2}s` }} />
              ) : (
                <Check className="w-4 h-4 text-primary" />
              )}
            </div>
            <span className="text-sm">{c.label}</span>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl bg-accent border border-primary/20 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80">
          <strong>A&R Lock:</strong> Your track will NOT go live immediately. Our A&R team reviews every submission to maintain quality standards. Average review time: 48 hours.
        </p>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
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
