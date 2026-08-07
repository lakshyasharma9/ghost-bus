import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, ChevronRight, FileAudio, FileArchive, Image,
  ShieldCheck, Loader2, AlertCircle, Music2, FolderOpen,
  FileCheck2, FileText, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { GENRES, COMMISSION_TIERS, getSellerTier } from "@/lib/mock-data";
import apiClient from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/upload")({
  head: () => ({ meta: [{ title: "Upload Track — GhostBus" }] }),
  component: UploadPage,
});

const STEPS = ["Metadata", "Files", "Transparency", "Pricing", "Agreement", "Verification"];
const KEYS = [
  "A min", "A maj", "B min", "B maj", "C min", "C maj", "D min", "D maj",
  "E min", "E maj", "F min", "F maj", "F# min", "F# maj", "G min", "G maj",
  "Bb min", "Bb maj",
];

// 28 / 72 split — matches backend PLATFORM_FEE_PCT
export const PLATFORM_FEE_PCT = 0.28;
export const SELLER_PAYOUT_PCT = 0.72;
export const MIN_PRICE = 149;
export const MAX_PRICE = 2000;

type VocalType = "none" | "exclusive" | "ai";
type FileSlot = { label: string; key: string; accept: string; icon: React.ReactNode; required: boolean };

/** Vocal types that require a Lyrics PDF */
export const VOCAL_TYPES_REQUIRING_LYRICS: VocalType[] = ["exclusive", "ai"];

const FILE_SLOTS: FileSlot[] = [
  { label: "Mastered WAV",         key: "mastered",   accept: ".wav",             icon: <FileAudio   className="w-5 h-5" />, required: true  },
  { label: "Unmastered WAV",       key: "unmastered", accept: ".wav",             icon: <FileAudio   className="w-5 h-5" />, required: true  },
  { label: "Stems ZIP",            key: "stems",      accept: ".zip",             icon: <FileArchive className="w-5 h-5" />, required: true  },
  { label: "MIDI ZIP",             key: "midi",       accept: ".zip",             icon: <FileArchive className="w-5 h-5" />, required: false },
  { label: "Artwork (3000×3000)",  key: "artwork",    accept: ".jpg,.jpeg,.png",  icon: <Image       className="w-5 h-5" />, required: true  },
];

// Optional track version previews (MP3 only, max 50MB)
const VERSION_SLOTS: FileSlot[] = [
  { label: "Radio Edit",     key: "radioEdit",     accept: ".mp3",  icon: <FileAudio className="w-5 h-5" />, required: false },
  { label: "Extended Mix",   key: "extendedMix",   accept: ".mp3",  icon: <FileAudio className="w-5 h-5" />, required: false },
  { label: "Instrumental",   key: "instrumental",  accept: ".mp3",  icon: <FileAudio className="w-5 h-5" />, required: false },
];

// Simulated seller lifetime sales
const SELLER_LIFETIME_SALES = 3200;

// ─── localStorage key for draft persistence ───────────────────────────────────
const DRAFT_KEY = "ghostbus_upload_draft_v1";

interface UploadDraft {
  step: number;
  meta: { title: string; genre: string; bpm: string; key: string; description: string; vocalType: VocalType };
  transparency: "original" | "loops" | null;
  price: string;
  // File names only (actual File objects can't be serialized — user is reminded to re-select)
  fileNames: Record<string, string | null>;
  savedAt: number;
}

function saveDraft(draft: Partial<UploadDraft>) {
  try {
    const existing = loadDraft();
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...existing, ...draft, savedAt: Date.now() }));
  } catch { /* storage full — non-critical */ }
}

function loadDraft(): UploadDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UploadDraft;
    // Expire drafts older than 7 days
    if (Date.now() - (parsed.savedAt ?? 0) > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch { return null; }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

function UploadPage() {
  // ── Restore draft on mount ──
  const draft = loadDraft();

  const [step, setStep] = useState(draft?.step ?? 0);
  const [meta, setMeta] = useState(draft?.meta ?? {
    title: "", genre: "", bpm: "", key: "", description: "", vocalType: "none" as VocalType,
  });
  const [files, setFiles] = useState<Record<string, File | null>>({
    mastered: null, unmastered: null, stems: null, midi: null,
    artwork: null, projectFile: null, lyrics: null,
    radioEdit: null, extendedMix: null, instrumental: null,
  });
  // Track file names from draft to show user which files they had selected
  const [draftFileNames] = useState<Record<string, string | null>>(draft?.fileNames ?? {});
  const [hasProjectFile, setHasProjectFile] = useState(false);
  const [transparency, setTransparency] = useState<"original" | "loops" | null>(draft?.transparency ?? null);
  const [price, setPrice] = useState(draft?.price ?? "");
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [hasDraft, setHasDraft] = useState(!!draft && (draft.step > 0 || draft.meta?.title));

  const qc = useQueryClient();
  const tier = getSellerTier(SELLER_LIFETIME_SALES);
  const lyricsRequired = VOCAL_TYPES_REQUIRING_LYRICS.includes(meta.vocalType);

  // ── Auto-save draft whenever state changes ──
  useEffect(() => {
    saveDraft({ step });
  }, [step]);

  useEffect(() => {
    saveDraft({ meta });
  }, [meta]);

  useEffect(() => {
    saveDraft({ transparency });
  }, [transparency]);

  useEffect(() => {
    saveDraft({ price });
  }, [price]);

  // Save file names (not file objects — those can't be serialized)
  useEffect(() => {
    const fileNames: Record<string, string | null> = {};
    Object.entries(files).forEach(([k, f]) => { fileNames[k] = f?.name ?? null; });
    saveDraft({ fileNames });
  }, [files]);

  // ── Clear draft after successful submit ──
  const clearFormAndDraft = useCallback(() => {
    clearDraft();
    setHasDraft(false);
    setStep(0);
    setMeta({ title: "", genre: "", bpm: "", key: "", description: "", vocalType: "none" });
    setFiles({ mastered: null, unmastered: null, stems: null, midi: null, artwork: null, projectFile: null, lyrics: null, radioEdit: null, extendedMix: null, instrumental: null });
    setTransparency(null);
    setPrice("");
    setAgreementAccepted(false);
    setVerified(false);
  }, []);

  const canNext = () => {
    if (step === 0) return meta.title && meta.genre && meta.bpm && meta.key && meta.description;
    if (step === 1) {
      const baseOk = FILE_SLOTS.filter((s) => s.required).every((s) => files[s.key]);
      if (!baseOk) return false;
      if (lyricsRequired && !files.lyrics) return false;
      return true;
    }
    if (step === 2) return transparency !== null;
    if (step === 3) {
      const n = parseFloat(price);
      return !isNaN(n) && n >= MIN_PRICE && n <= MAX_PRICE;
    }
    if (step === 4) return agreementAccepted;
    return true;
  };

  const next = async () => {
    if (!canNext()) {
      if (step === 1 && lyricsRequired && !files.lyrics) {
        toast.error("Please upload the Lyrics PDF — required for your selected vocal type.");
        return;
      }
      toast.error("Please complete all required fields");
      return;
    }

    // Step 5 = final submit — send to real backend API
    if (step === 5) {
      setVerifying(true);
      try {
        const fd = new FormData();

        // ── Required files ──
        if (!files.mastered || !files.unmastered || !files.stems || !files.artwork) {
          toast.error("Required files are missing.");
          setVerifying(false);
          return;
        }
        fd.append("mastered",   files.mastered);
        fd.append("unmastered", files.unmastered);
        fd.append("stems",      files.stems);
        fd.append("artwork",    files.artwork);
        if (files.midi)    fd.append("midi",    files.midi);
        if (files.lyrics)  fd.append("lyrics",  files.lyrics);
        // Optional preview versions
        if (files.radioEdit)     fd.append("radioEdit",     files.radioEdit);
        if (files.extendedMix)   fd.append("extendedMix",   files.extendedMix);
        if (files.instrumental)  fd.append("instrumental",  files.instrumental);

        // ── Metadata ──
        fd.append("title",        meta.title.trim());
        fd.append("genre",        meta.genre);
        fd.append("bpm",          meta.bpm);
        fd.append("key",          meta.key);
        fd.append("description",  meta.description.trim());
        fd.append("price",        price);
        fd.append("transparency", transparency!);
        fd.append("vocalType",    meta.vocalType);
        fd.append("isExclusive",  "true");

        const { data } = await apiClient.post("/tracks", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 5 * 60 * 1000, // 5 min timeout for large files
        });

        // Invalidate my-tracks cache so dashboard shows the new track
        qc.invalidateQueries({ queryKey: ["my-tracks"] });

        setVerifying(false);
        setVerified(true);
        clearDraft(); // ── Clear saved draft on successful submit ──
        setHasDraft(false);
        toast.success("Track submitted for A&R review!");
      } catch (err: any) {
        setVerifying(false);
        const msg = err?.response?.data?.message ?? err?.message ?? "Upload failed. Please try again.";
        toast.error(msg);
      }
      return;
    }

    setStep((s) => s + 1);
  };

  return (
    <div className="pt-4 pb-24 max-w-3xl">
      <div className="mb-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="label-eyebrow mb-2">Seller Dashboard</div>
            <h1 className="font-display text-4xl font-semibold tracking-tight">Upload a Track</h1>
            <p className="text-muted-foreground mt-2">Complete all 6 steps to submit your track for A&R review.</p>
          </div>
          {/* Draft status indicator */}
          {hasDraft && !verified && (
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Draft auto-saved
              </span>
              <button
                onClick={() => {
                  clearDraft();
                  setHasDraft(false);
                  setStep(0);
                  setMeta({ title: "", genre: "", bpm: "", key: "", description: "", vocalType: "none" });
                  setFiles({ mastered: null, unmastered: null, stems: null, midi: null, artwork: null, projectFile: null, lyrics: null, radioEdit: null, extendedMix: null, instrumental: null });
                  setTransparency(null);
                  setPrice("");
                  setAgreementAccepted(false);
                  toast.info("Draft cleared — starting fresh.");
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition px-2 py-1.5 rounded-full border border-border hover:border-destructive/40"
                title="Discard saved draft and start fresh"
              >
                <RotateCcw className="w-3 h-3" /> Clear draft
              </button>
            </div>
          )}
        </div>
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
                i < step   ? "bg-primary text-primary-foreground" :
                i === step ? "bg-foreground text-background" :
                             "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {s}
              </span>
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
          {step === 1 && (
            <StepFiles
              files={files} setFiles={setFiles}
              hasProjectFile={hasProjectFile} setHasProjectFile={setHasProjectFile}
              vocalType={meta.vocalType}
              draftFileNames={draftFileNames}
            />
          )}
          {step === 2 && <StepTransparency value={transparency} onChange={setTransparency} />}
          {step === 3 && <StepPricing price={price} setPrice={setPrice} tier={tier} />}
          {step === 4 && <StepAgreement price={price} accepted={agreementAccepted} setAccepted={setAgreementAccepted} />}
          {step === 5 && <StepVerification verifying={verifying} verified={verified} meta={meta} />}
        </motion.div>
      </AnimatePresence>

      {!verified && (
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="h-11 px-5 rounded-full border border-border text-sm font-medium disabled:opacity-40 hover:bg-muted transition"
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={verifying}
            className="h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2 shadow-[0_10px_30px_rgba(6,2,38,0.35)] disabled:opacity-60 hover:bg-[--color-primary-hover] transition"
          >
            {verifying
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
              : step === 5
                ? "Submit for Review"
                : <>Next <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      )}
    </div>
  );
}


// ── Step 1: Metadata ──────────────────────────────────────────────────────────

function StepMetadata({ meta, setMeta }: { meta: any; setMeta: any }) {
  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-xl">Step 1 — Track Metadata</h2>
      <Field
        label="Track Title *"
        placeholder="e.g. Midnight Protocol"
        value={meta.title}
        onChange={(v) => setMeta({ ...meta, title: v })}
      />

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
        <Field
          label="BPM *"
          placeholder="e.g. 128"
          type="number"
          value={meta.bpm}
          onChange={(v) => setMeta({ ...meta, bpm: v })}
        />
        <div>
          <label className="block text-xs font-medium text-foreground/80 mb-1.5">Key *</label>
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

      {/* Vocal Type */}
      <div>
        <label className="block text-xs font-medium text-foreground/80 mb-1.5">Vocal Type</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            ["none",      "Instrumental",    "No vocals — purely instrumental track"],
            ["exclusive", "Exclusive Vocals", "Original vocals with full rights transfer included"],
            ["ai",        "AI Vocals",        "AI-generated vocals — Lyrics PDF only, no voice rights"],
          ] as const).map(([val, label, desc]) => (
            <button
              key={val}
              type="button"
              onClick={() => setMeta({ ...meta, vocalType: val })}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                meta.vocalType === val ? "border-primary bg-accent" : "border-border hover:border-primary/40"
              }`}
            >
              <div className="font-medium text-xs mb-0.5">{label}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{desc}</div>
            </button>
          ))}
        </div>
        {VOCAL_TYPES_REQUIRING_LYRICS.includes(meta.vocalType) && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-xs text-primary flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            A Lyrics PDF upload will be required in the Files step.
          </motion.p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground/80 mb-1.5">Description *</label>
        <textarea
          value={meta.description}
          onChange={(e) => setMeta({ ...meta, description: e.target.value })}
          placeholder="Describe your track's vibe, influences, and what makes it unique..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm resize-none"
        />
      </div>
    </div>
  );
}


// ── Step 2: Files ─────────────────────────────────────────────────────────────

function StepFiles({
  files, setFiles, hasProjectFile, setHasProjectFile, vocalType, draftFileNames,
}: {
  files: Record<string, File | null>;
  setFiles: any;
  hasProjectFile: boolean;
  setHasProjectFile: (v: boolean) => void;
  vocalType: VocalType;
  draftFileNames?: Record<string, string | null>;
}) {
  const lyricsRequired = VOCAL_TYPES_REQUIRING_LYRICS.includes(vocalType);

  const handleLyricsFile = (f: File) => {
    // Client-side PDF validation
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are accepted for lyrics.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("Lyrics PDF is too large. Maximum size is 20 MB.");
      return;
    }
    setFiles({ ...files, lyrics: f });
  };

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-xl">Step 2 — File Uploads</h2>
      <p className="text-sm text-muted-foreground">
        Upload all required files. Files are stored securely and never shared publicly.
      </p>

      {/* Draft file names reminder — files can't be restored from localStorage (binary) */}
      {draftFileNames && Object.values(draftFileNames).some(Boolean) && Object.values(files).every(f => !f) && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm">
          <div className="font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Previous session files (please re-select)
          </div>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(draftFileNames).filter(([, n]) => n).map(([k, name]) => (
              <div key={k} className="text-amber-700 text-xs truncate">
                <span className="font-medium capitalize">{k}:</span> {name}
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-600 mt-2">
            File contents cannot be saved in the browser. Please select the same files again.
          </p>
        </div>
      )}

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

      {/* ── Track Versions (optional previews) ── */}
      <div className="mt-6 p-5 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold">Track versions</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">optional previews</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          If your Track Files ZIP includes other versions (radio edit, extended mix, instrumental), upload an MP3 preview of each here so buyers can hear them on the track page before purchasing. Max 50MB per file.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VERSION_SLOTS.map((slot) => (
            <FileDropZone
              key={slot.key}
              slot={slot}
              file={files[slot.key]}
              onFile={(f) => setFiles({ ...files, [slot.key]: f })}
            />
          ))}
        </div>
      </div>

      {/* ── Conditional Lyrics PDF field ── */}
      <AnimatePresence>
        {lyricsRequired && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl border-2 border-primary/30 bg-primary/5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <FileText className="w-4 h-4 shrink-0" />
                Lyrics PDF Required
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {vocalType === "exclusive"
                  ? "Original vocals with full rights transfer — please upload the complete lyrics as a PDF."
                  : "AI-generated vocals — please upload the lyrics PDF (voice rights are not included)."}
              </p>
              <FileDropZone
                slot={{
                  label: "Lyrics (PDF) *",
                  key: "lyrics",
                  accept: ".pdf",
                  icon: <FileText className="w-5 h-5" />,
                  required: true,
                }}
                file={files.lyrics}
                onFile={handleLyricsFile}
                validateFn={(f) => {
                  if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
                    return "Only PDF files are accepted.";
                  }
                  if (f.size > 20 * 1024 * 1024) {
                    return "File too large. Maximum 20 MB.";
                  }
                  return null;
                }}
              />
              {!files.lyrics && (
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Lyrics PDF is required to proceed.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project File toggle */}
      <div className="mt-2">
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center">
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-sm font-medium">Include Project File</div>
              <div className="text-xs text-muted-foreground">Full DAW project (FL Studio, Ableton, etc.)</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hasProjectFile}
              onChange={(e) => setHasProjectFile(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
          </label>
        </div>

        <AnimatePresence>
          {hasProjectFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-2"
            >
              <FileDropZone
                slot={{ label: "Project File ZIP", key: "projectFile", accept: ".zip", icon: <FolderOpen className="w-5 h-5" />, required: false }}
                file={files.projectFile}
                onFile={(f) => setFiles({ ...files, projectFile: f })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


// ── FileDropZone ──────────────────────────────────────────────────────────────

function FileDropZone({
  slot, file, onFile, validateFn,
}: {
  slot: FileSlot;
  file: File | null;
  onFile: (f: File) => void;
  validateFn?: (f: File) => string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File) => {
    if (validateFn) {
      const err = validateFn(f);
      if (err) {
        setError(err);
        toast.error(err);
        return;
      }
    }
    setError(null);
    onFile(f);
  };

  return (
    <div className="space-y-1">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
          error    ? "border-destructive bg-destructive/5" :
          dragging ? "border-primary bg-accent" :
          file     ? "border-primary/40 bg-accent/50" :
                     "border-border hover:border-primary/40 hover:bg-muted/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={slot.accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
          error ? "bg-destructive/10 text-destructive" :
          file  ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
        }`}>
          {file && !error ? <Check className="w-5 h-5" /> : slot.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            {slot.label} {slot.required && <span className="text-destructive">*</span>}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {file ? file.name : `Click or drag · ${slot.accept.toUpperCase().replace(/\./g, "")}`}
          </div>
        </div>
        {file && !error && (
          <span className="text-xs text-muted-foreground shrink-0">
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive pl-1">{error}</p>}
    </div>
  );
}


// ── Step 3: Transparency ──────────────────────────────────────────────────────

function StepTransparency({ value, onChange }: {
  value: "original" | "loops" | null;
  onChange: (v: "original" | "loops") => void;
}) {
  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-xl">Step 3 — Transparency Declaration</h2>
      <p className="text-sm text-muted-foreground">
        Buyers deserve to know what they're purchasing. Declare the origin of your track honestly.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => onChange("original")}
          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
            value === "original" ? "border-primary bg-accent" : "border-border hover:border-primary/40"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
              value === "original" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">100% Original Production</div>
              <p className="text-sm text-muted-foreground mt-1">
                Every element was created from scratch by me. No third-party loops, samples,
                or presets from sample packs were used.
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => onChange("loops")}
          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
            value === "loops" ? "border-primary bg-accent" : "border-border hover:border-primary/40"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
              value === "loops" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">Contains Royalty-Free Loops</div>
              <p className="text-sm text-muted-foreground mt-1">
                This track uses royalty-free loops from licensed sample packs.
                All elements are cleared for commercial use and rights transfer.
              </p>
            </div>
          </div>
        </button>
      </div>
      <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          False declarations may result in account suspension and legal liability.
          Our A&R team verifies all submissions.
        </p>
      </div>
    </div>
  );
}


// ── Step 4: Pricing ───────────────────────────────────────────────────────────

function StepPricing({ price, setPrice, tier }: {
  price: string;
  setPrice: (v: string) => void;
  tier: typeof COMMISSION_TIERS[number];
}) {
  const PRESETS = [149, 199, 249, 299, 399, 499, 699, 999, 1299, 1499];
  const num = parseFloat(price) || 0;

  // Real-time fee calculation
  const platformFee  = num > 0 ? Math.round(num * PLATFORM_FEE_PCT * 100) / 100 : 0;
  const sellerPayout = num > 0 ? Math.round(num * SELLER_PAYOUT_PCT * 100) / 100 : 0;

  const isValid = num >= MIN_PRICE && num <= MAX_PRICE;
  const isTooLow  = num > 0 && num < MIN_PRICE;
  const isTooHigh = num > MAX_PRICE;

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-xl">Step 4 — Set Your Price</h2>

      {/* Fee split banner */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-accent border border-primary/20">
        <div>
          <div className="text-xs font-semibold text-primary">Revenue Split</div>
          <div className="text-xs text-muted-foreground mt-0.5">Applied to every sale</div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-foreground">72%</div>
            <div className="text-xs text-muted-foreground">You receive</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="font-bold text-muted-foreground">28%</div>
            <div className="text-xs text-muted-foreground">Platform fee</div>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Set a price between <strong className="text-foreground">€{MIN_PRICE}</strong> and €{MAX_PRICE}.
        The minimum selling price is €{MIN_PRICE}.
      </p>

      <div>
        <label className="block text-xs font-medium text-foreground/80 mb-1.5">Price (EUR) *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg select-none">€</span>
          <input
            type="number"
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={String(MIN_PRICE)}
            className={`w-full h-14 pl-9 pr-4 rounded-xl border bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 text-2xl font-semibold transition ${
              isTooLow || isTooHigh
                ? "border-destructive focus:border-destructive"
                : "border-border focus:border-primary/40"
            }`}
          />
        </div>
        {isTooLow && (
          <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Minimum price is €{MIN_PRICE}.
          </p>
        )}
        {isTooHigh && (
          <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Maximum price is €{MAX_PRICE}.
          </p>
        )}
      </div>

      {/* Quick-select presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPrice(String(p))}
            className={`h-9 px-4 rounded-full text-sm font-medium border transition ${
              price === String(p)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary/40"
            }`}
          >
            €{p}
          </button>
        ))}
      </div>

      {/* Real-time breakdown — only shown when price is valid */}
      <AnimatePresence>
        {isValid && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="p-5 rounded-2xl bg-card border border-border space-y-3"
          >
            <div className="label-eyebrow text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Pricing Breakdown
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Track price</span>
              <span className="font-semibold">€{num.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform fee (28%)</span>
              <span className="text-muted-foreground">−€{platformFee.toFixed(2)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between font-bold">
              <span>Your payout (72%)</span>
              <span className="text-primary text-lg">€{sellerPayout.toFixed(2)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground">
          GhostBus retains a fixed <strong className="text-foreground">28% platform fee</strong> on every sale.
          You keep <strong className="text-foreground">72%</strong> of the track price, paid out after purchase completion.
          Prices cannot be changed after submission without contacting support.
        </p>
      </div>
    </div>
  );
}


// ── Step 5: Agreement ─────────────────────────────────────────────────────────

function StepAgreement({ price, accepted, setAccepted }: {
  price: string;
  accepted: boolean;
  setAccepted: (v: boolean) => void;
}) {
  const num          = parseFloat(price) || 0;
  const platformFee  = Math.round(num * PLATFORM_FEE_PCT * 100) / 100;
  const sellerPayout = Math.round(num * SELLER_PAYOUT_PCT * 100) / 100;

  const terms = [
    {
      title: "Exclusivity & Rights Transfer",
      body: "Upon sale, you irrevocably transfer 100% of all rights to the buyer — copyright, master, publishing, and all commercial exploitation rights worldwide, in perpetuity. The track must be exclusive to GhostBus and may not be listed elsewhere.",
    },
    {
      title: "Pricing Agreement",
      body: `You agree to list this track at €${num.toFixed(2)}. GhostBus retains a 28% platform fee (€${platformFee.toFixed(2)}). Your payout upon sale will be €${sellerPayout.toFixed(2)}. Prices cannot be changed after submission.`,
    },
    {
      title: "Review & Publication",
      body: "Your track will NOT go live immediately. Our A&R team reviews every submission within 72 hours. If approved, a watermarked preview is generated and the track is published on the marketplace.",
    },
    {
      title: "Originality & Accuracy",
      body: "You confirm all metadata, files, and transparency declarations are accurate. False or misleading information will result in immediate account suspension and potential legal liability.",
    },
    {
      title: "Confidentiality",
      body: "You agree to maintain strict confidentiality on all transactions. You may not publicly claim authorship of any sold track, disclose buyer details, or share transaction information.",
    },
  ];

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-xl">Step 5 — Agreement of Price &amp; Terms</h2>
      <p className="text-sm text-muted-foreground">
        Review and accept the terms below before submitting your track for review.
      </p>

      {/* Price summary card */}
      <div className="p-4 rounded-xl bg-accent border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Agreed listing price</div>
            <div className="text-2xl font-bold text-primary mt-0.5">€{num.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Your payout (72%)</div>
            <div className="text-lg font-semibold mt-0.5">€{sellerPayout.toFixed(2)}</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
          <span>Platform fee (28%)</span>
          <span>€{platformFee.toFixed(2)}</span>
        </div>
      </div>

      {/* Terms */}
      <div className="space-y-3">
        {terms.map((t) => (
          <div key={t.title} className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 grid place-items-center shrink-0 mt-0.5">
                <FileCheck2 className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">{t.title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Acceptance checkbox */}
      <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
        accepted ? "border-primary bg-accent" : "border-border hover:border-primary/40"
      }`}>
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded border-2 grid place-items-center shrink-0 mt-0.5 transition-all ${
          accepted ? "bg-primary border-primary" : "border-border"
        }`}>
          {accepted && <Check className="w-3 h-3 text-white" />}
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          I have read and agree to all terms above. I confirm this track is priced at{" "}
          <strong>€{num.toFixed(2)}</strong>, I will receive{" "}
          <strong>€{sellerPayout.toFixed(2)}</strong> upon sale (after 28% platform fee),
          and I understand the track will be reviewed within <strong>72 hours</strong> before going live.
        </p>
      </label>

      {!accepted && (
        <p className="text-xs text-muted-foreground text-center">
          You must accept the agreement to proceed to verification.
        </p>
      )}
    </div>
  );
}


// ── Step 6: Verification ──────────────────────────────────────────────────────

function StepVerification({ verifying, verified, meta }: {
  verifying: boolean;
  verified: boolean;
  meta: any;
}) {
  const checks = [
    "ZIP file structure validation",
    "Audio quality check (min 24-bit WAV)",
    "Artwork resolution check (3000×3000)",
    "Uniqueness scan via MRT API (ACRCloud)",
    "Metadata completeness check",
  ];

  if (verified) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 grid place-items-center mb-6">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-semibold">Track Submitted!</h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">
          "{meta.title}" has been submitted for A&R review. You'll receive an email within 72 hours.
        </p>
        <div className="mt-8 p-5 rounded-2xl bg-card border border-border text-left max-w-sm mx-auto">
          <div className="label-eyebrow mb-3">What happens next?</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> A&R team reviews your track</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Watermarked preview generated</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Track goes live on marketplace</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> 72% payout on sale</li>
          </ul>
        </div>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex h-11 px-6 items-center rounded-full bg-primary text-primary-foreground font-medium hover:bg-[--color-primary-hover] transition"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-xl">Step 6 — Verification</h2>
      <p className="text-sm text-muted-foreground">
        Automated checks run before submission. After passing, your track enters the A&R review queue.
      </p>
      <div className="space-y-3">
        {checks.map((c, i) => (
          <div key={c} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${verifying ? "bg-muted" : "bg-primary/10"}`}>
              {verifying ? (
                <Loader2
                  className="w-4 h-4 text-muted-foreground animate-spin"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ) : (
                <Check className="w-4 h-4 text-primary" />
              )}
            </div>
            <span className="text-sm">{c}</span>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl bg-accent border border-primary/20 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80">
          <strong>A&R Lock:</strong> Your track will NOT go live immediately. Our A&R team reviews
          every submission to maintain quality standards. Average review time: <strong>72 hours</strong>.
        </p>
      </div>
    </div>
  );
}

// ── Shared Field ──────────────────────────────────────────────────────────────

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
