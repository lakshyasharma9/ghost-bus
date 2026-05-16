import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, FileAudio, FileArchive, Image, ShieldCheck, Loader2, AlertCircle, Music2 } from "lucide-react";
import { toast } from "sonner";
import { GENRES } from "@/lib/mock-data";
import { useUploadTrack, uploadTrackFiles } from "@/hooks/use-api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/upload")({
  head: () => ({ meta: [{ title: "Upload Track — Dashboard" }] }),
  component: DashboardUpload,
});

const STEPS = ["Metadata", "Files", "Transparency", "Pricing", "Submit"];
const KEYS = ["A min","A maj","B min","B maj","C min","C maj","D min","D maj","E min","E maj","F min","F maj","F# min","F# maj","G min","G maj","Bb min","Bb maj"];

type FileSlot = { label: string; key: string; accept: string; icon: React.ReactNode; required: boolean };
const FILE_SLOTS: FileSlot[] = [
  { label: "Mastered WAV", key: "mastered", accept: ".wav", icon: <FileAudio className="w-5 h-5" />, required: true },
  { label: "Unmastered WAV", key: "unmastered", accept: ".wav", icon: <FileAudio className="w-5 h-5" />, required: true },
  { label: "Stems ZIP", key: "stems", accept: ".zip", icon: <FileArchive className="w-5 h-5" />, required: true },
  { label: "MIDI ZIP", key: "midi", accept: ".zip", icon: <FileArchive className="w-5 h-5" />, required: false },
  { label: "Artwork (3000×3000)", key: "artwork", accept: ".jpg,.jpeg,.png", icon: <Image className="w-5 h-5" />, required: true },
];

function DashboardUpload() {
  const [step, setStep] = useState(0);
  const [meta, setMeta] = useState({ title: "", genre: "", bpm: "", key: "", description: "" });
  const [files, setFiles] = useState<Record<string, File | null>>({ mastered: null, unmastered: null, stems: null, midi: null, artwork: null });
  const [transparency, setTransparency] = useState<"original" | "loops" | null>(null);
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const uploadTrack = useUploadTrack();

  const canNext = () => {
    if (step === 0) return meta.title && meta.genre && meta.bpm && meta.key && meta.description;
    if (step === 1) return FILE_SLOTS.filter((s) => s.required).every((s) => files[s.key]);
    if (step === 2) return transparency !== null;
    if (step === 3) return price && parseInt(price) >= 199 && parseInt(price) <= 2000;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload files to Supabase Storage
      const tempId = crypto.randomUUID();
      const urls = await uploadTrackFiles(user.id, tempId, files);

      await uploadTrack.mutateAsync({
        seller_id: user.id,
        title: meta.title,
        genre: meta.genre,
        bpm: parseInt(meta.bpm),
        musical_key: meta.key,
        description: meta.description,
        price: parseInt(price),
        transparency: transparency!,
        artwork_url: urls.artwork ?? null,
        mastered_url: urls.mastered ?? null,
        unmastered_url: urls.unmastered ?? null,
        stems_url: urls.stems ?? null,
        midi_url: urls.midi ?? null,
        tags: [],
      } as any);

      setSubmitted(true);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (!canNext()) { toast.error("Please complete all required fields"); return; }
    if (step === 4) { handleSubmit(); return; }
    setStep((s) => s + 1);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <div className="label-eyebrow mb-2">Upload</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Upload a Track</h1>
        <p className="text-muted-foreground mt-1.5">Complete all 5 steps to submit for A&R review.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <button onClick={() => i < step && setStep(i)} className={`flex items-center gap-2 shrink-0 ${i < step ? "cursor-pointer" : "cursor-default"}`}>
              <div className={`w-8 h-8 rounded-full grid place-items-center text-xs font-semibold transition-all ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 transition-colors ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
          {step === 0 && <StepMetadata meta={meta} setMeta={setMeta} />}
          {step === 1 && <StepFiles files={files} setFiles={setFiles} />}
          {step === 2 && <StepTransparency value={transparency} onChange={setTransparency} />}
          {step === 3 && <StepPricing price={price} setPrice={setPrice} />}
          {step === 4 && <StepSubmit submitting={submitting} submitted={submitted} meta={meta} />}
        </motion.div>
      </AnimatePresence>

      {!submitted && (
        <div className="mt-8 flex items-center justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="h-10 px-5 rounded-full border border-border text-sm font-medium disabled:opacity-40">Back</button>
          <button onClick={next} disabled={submitting} className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2 shadow-[0_8px_24px_rgba(10,132,255,0.28)] disabled:opacity-60">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : step === 4 ? "Submit for Review" : <>Next <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      )}
    </div>
  );
}

function StepMetadata({ meta, setMeta }: { meta: any; setMeta: any }) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Step 1 — Track Metadata</h2>
      <Field label="Track Title *" placeholder="e.g. Midnight Protocol" value={meta.title} onChange={(v) => setMeta({ ...meta, title: v })} />
      <div>
        <label className="block text-xs font-medium text-foreground/80 mb-1.5">Genre *</label>
        <select value={meta.genre} onChange={(e) => setMeta({ ...meta, genre: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm">
          <option value="">Select genre...</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="BPM *" placeholder="128" type="number" value={meta.bpm} onChange={(v) => setMeta({ ...meta, bpm: v })} />
        <div>
          <label className="block text-xs font-medium text-foreground/80 mb-1.5">Musical Key *</label>
          <select value={meta.key} onChange={(e) => setMeta({ ...meta, key: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm">
            <option value="">Select key...</option>
            {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-foreground/80 mb-1.5">Description *</label>
        <textarea value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} placeholder="Describe your track, vibe, influences..." rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm resize-none" />
      </div>
    </div>
  );
}

function StepFiles({ files, setFiles }: { files: Record<string, File | null>; setFiles: any }) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Step 2 — File Uploads</h2>
      <p className="text-sm text-muted-foreground">Files are encrypted and stored securely in Supabase Storage.</p>
      <div className="space-y-2.5">
        {FILE_SLOTS.map((slot) => (
          <FileDropZone key={slot.key} slot={slot} file={files[slot.key]} onFile={(f) => setFiles({ ...files, [slot.key]: f })} />
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
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      onClick={() => inputRef.current?.click()}
      className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${dragging ? "border-primary bg-accent" : file ? "border-primary/40 bg-accent/50" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}
    >
      <input ref={inputRef} type="file" accept={slot.accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${file ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        {file ? <Check className="w-4 h-4" /> : slot.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{slot.label} {slot.required && <span className="text-destructive">*</span>}</div>
        <div className="text-xs text-muted-foreground truncate">{file ? file.name : `Click or drag · ${slot.accept}`}</div>
      </div>
      {file && <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024 / 1024).toFixed(1)} MB</span>}
    </div>
  );
}

function StepTransparency({ value, onChange }: { value: "original" | "loops" | null; onChange: (v: "original" | "loops") => void }) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Step 3 — Transparency Declaration</h2>
      <p className="text-sm text-muted-foreground">Declare the origin of your track honestly.</p>
      <div className="space-y-3">
        {[
          { v: "original" as const, icon: <ShieldCheck className="w-5 h-5" />, title: "100% Original Production", desc: "Every element created from scratch. No third-party loops or sample packs." },
          { v: "loops" as const, icon: <Music2 className="w-5 h-5" />, title: "Contains Royalty-Free Loops", desc: "Uses royalty-free loops from licensed packs. All cleared for commercial use." },
        ].map((opt) => (
          <button key={opt.v} onClick={() => onChange(opt.v)} className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${value === opt.v ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}>
            <div className="flex items-start gap-4">
              <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${value === opt.v ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{opt.icon}</div>
              <div><div className="font-semibold">{opt.title}</div><p className="text-sm text-muted-foreground mt-1">{opt.desc}</p></div>
            </div>
          </button>
        ))}
      </div>
      <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">False declarations may result in account suspension. Our A&R team verifies all submissions.</p>
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
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Step 4 — Set Your Price</h2>
      <p className="text-sm text-muted-foreground">Price between ₹199–₹2,000. GhostBus takes a 15% platform fee.</p>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
        <input type="number" min={199} max={2000} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="499" className="w-full h-14 pl-8 pr-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-2xl font-semibold" />
      </div>
      {price && (num < 199 || num > 2000) && <p className="text-xs text-destructive">Price must be between ₹199 and ₹2,000</p>}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p} onClick={() => setPrice(String(p))} className={`h-9 px-4 rounded-full text-sm font-medium border transition ${price === String(p) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}>₹{p}</button>
        ))}
      </div>
      {price && num >= 199 && num <= 2000 && (
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <div className="label-eyebrow">Earnings Breakdown</div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Track price</span><span className="font-medium">₹{num}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Platform fee (15%)</span><span className="text-muted-foreground">-₹{platform}</span></div>
          <div className="flex justify-between font-semibold border-t border-border pt-3"><span>Your payout</span><span className="text-primary text-lg">₹{payout}</span></div>
        </div>
      )}
    </div>
  );
}

function StepSubmit({ submitting, submitted, meta }: { submitting: boolean; submitted: boolean; meta: any }) {
  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 grid place-items-center mb-5">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-semibold">Track Submitted!</h2>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">"{meta.title}" is in the A&R review queue. You'll hear back within 48 hours.</p>
        <div className="mt-6 p-5 rounded-2xl bg-card border border-border text-left max-w-xs mx-auto">
          <div className="label-eyebrow mb-3">What happens next?</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {["A&R team reviews your track", "Watermarked preview generated", "Track goes live on marketplace", "Instant payout on sale"].map((s) => (
              <li key={s} className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />{s}</li>
            ))}
          </ul>
        </div>
        <Link to="/dashboard/tracks" className="mt-6 inline-flex h-10 px-5 items-center rounded-full bg-primary text-primary-foreground text-sm font-medium">View My Tracks</Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Step 5 — Review & Submit</h2>
      <p className="text-sm text-muted-foreground">Your files will be uploaded to secure storage and your track will enter the A&R review queue.</p>
      <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
        <div className="label-eyebrow mb-2">Summary</div>
        {[
          ["Title", meta.title],
          ["Genre", meta.genre],
          ["BPM", meta.bpm],
          ["Key", meta.key],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium">{v}</span>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl bg-accent border border-primary/20 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80"><strong>A&R Lock:</strong> Track won't go live immediately. Average review time: 48 hours.</p>
      </div>
      {submitting && (
        <div className="p-4 rounded-xl bg-muted flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm">Uploading files to secure storage...</span>
        </div>
      )}
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground/80 mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm" />
    </div>
  );
}
