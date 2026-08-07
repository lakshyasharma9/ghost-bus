import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Check, X, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/how-to-upload-tracks")({
  head: () => ({
    meta: [
      { title: "How to Upload Tracks — Seller Upload Guide | GhostBus" },
      { name: "description", content: "Complete guide for ghost producers on how to upload, price, and sell exclusive tracks on GhostBus." },
    ],
  }),
  component: HowToUploadTracks,
});

const SECTIONS = [
  { id: "file-requirements", label: "File Requirements" },
  { id: "zip-structure",     label: "ZIP Structure" },
  { id: "supported-daws",    label: "Supported DAWs" },
  { id: "music-quality",     label: "Music Quality" },
  { id: "vocals",            label: "Vocals" },
  { id: "melodic-samples",   label: "Melodic Samples" },
  { id: "track-metadata",    label: "Track Metadata & SEO" },
  { id: "artwork",           label: "Artwork" },
  { id: "pricing",           label: "Pricing" },
  { id: "legal",             label: "Legal & Terms" },
];

// Shared dark card style — #000019 bg, subtle white border
const CARD = { background: "#000019", border: "1px solid rgba(255,255,255,0.10)" } as const;
const CARD_CLS = "rounded-xl";

function HowToUploadTracks() {
  const [active, setActive] = useState("file-requirements");
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SECTIONS.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.current?.observe(el); });
    return () => observer.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="bg-background" style={{ minHeight: "100vh" }}>

      {/* ── HERO (dark) ── */}
      <section className="relative pt-24 pb-16 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #060226 0%, #0d0540 55%, #1a0f8f 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)" }} />
        <div className="container-app relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 text-[11px] font-bold tracking-widest uppercase text-white/60 mb-6">
            Selling Guide
          </div>
          <h1 className="font-display font-bold text-white mb-4 tracking-tight"
            style={{ fontSize: "clamp(32px,5vw,58px)", lineHeight: 1.08 }}>
            How to Upload Your Tracks
          </h1>
          <p className="text-white/65 text-base leading-relaxed max-w-xl mx-auto">
            Welcome to GhostBus. This comprehensive, industry-level guide contains everything you need to accurately submit, price, and sell your ghost-produced music on the GhostBus platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/apply-seller"
              className="h-11 px-6 inline-flex items-center gap-2 rounded-full bg-white text-[#060226] text-sm font-bold hover:bg-white/90 transition shadow-lg">
              Apply to Sell <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/dashboard/upload"
              className="h-11 px-6 inline-flex items-center gap-2 rounded-full border border-white/25 text-white text-sm font-medium hover:bg-white/8 transition">
              Upload a Track
            </Link>
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="container-app py-16">
        <div className="flex gap-10 items-start">

          {/* Sticky Sidebar */}
          <aside className="hidden lg:block w-52 shrink-0 sticky top-24">
            <div className="text-[10px] font-bold tracking-widest uppercase text-foreground/30 mb-3">Contents</div>
            <nav className="space-y-0.5">
              {SECTIONS.map(({ id, label }) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150"
                  style={active === id
                    ? { background: "#000019", color: "#fff", fontWeight: 600 }
                    : { color: "rgba(0,0,0,0.45)" }
                  }
                >
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 space-y-20">

            {/* FILE REQUIREMENTS */}
            <Section id="file-requirements" title="File Requirements">
              <p className="text-foreground/60 text-sm leading-relaxed mb-5">
                Every submission must include the following assets. Incomplete packages will be automatically rejected. All files must be completely stripped of metadata — artist name, producer name, studio, etc.
              </p>
              <div className={`${CARD_CLS} overflow-hidden`} style={CARD}>
                <div className="grid grid-cols-[1.8fr_1fr_2.5fr_auto] text-[10px] font-bold tracking-widest uppercase px-5 py-3 gap-4 border-b"
                  style={{ color: "rgba(255,255,255,0.35)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <span>File Type</span><span>Format</span><span>Specification</span><span>Status</span>
                </div>
                {[
                  ["Mastered Version",      "WAV + MP3",    "WAV: 16-bit or 24-bit, 44.1kHz · MP3: 320kbps",                                                          "required"],
                  ["Unmastered Mixdown",    "WAV",          "16-bit or 24-bit, 44.1kHz · Min −3dB headroom · No master channel processing",                           "required"],
                  ["Labeled Stems",         "WAV",          "Individual tracks clearly labeled (Kick, Snare, Bass, Lead) · 16-bit or 24-bit, 44.1kHz",                 "required"],
                  ["MIDI Files",            "MIDI",         "All melodic and harmonic parts from the track",                                                           "required"],
                  ["Vocals & Lyrics",       "TXT / PDF",    "Sample Vocals: Sample Name & URL · AI & Exclusive Vocals: Full Lyrics PDF mandatory",                     "if-vocals"],
                  ["Project File",          "DAW-specific", "Full project package including all third-party samples, loops, and assets",                               "optional"],
                  ["Instrumental",          "WAV + MP3",    "Fully mastered instrumental version — required when vocals are present",                                  "if-vocals"],
                  ["Extended & Radio Edit", "WAV + MP3",    "Extended Mix (4–8 min) and Radio Edit (2–3 min) — highly recommended for increased sales",                "optional"],
                ].map(([type, fmt, spec, status]) => (
                  <div key={type} className="grid grid-cols-[1.8fr_1fr_2.5fr_auto] items-center gap-4 px-5 py-3.5 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <span className="text-white text-sm font-medium">{type}</span>
                    <span className="text-white/45 text-xs font-mono">{fmt}</span>
                    <span className="text-white/45 text-xs leading-relaxed">{spec}</span>
                    <Badge status={status} />
                  </div>
                ))}
              </div>
              <Alert>
                <strong className="text-foreground font-semibold">All files must be free of metadata.</strong>{" "}
                <span className="text-foreground/60">WAV, MP3, DAW project files, and any other submitted files must contain no embedded metadata — including artist name, producer name, or studio name. Strip all metadata before uploading.</span>
              </Alert>
            </Section>

            {/* ZIP STRUCTURE */}
            <Section id="zip-structure" title="ZIP Package Structure">
              <p className="text-foreground/60 text-sm leading-relaxed mb-5">
                Your submission must be compressed into a single ZIP file with a clean, organized folder hierarchy. Flat or disorganized folders will be returned for structural correction.
              </p>
              <div className={CARD_CLS} style={CARD}>
                <div className="px-5 py-3 flex items-center gap-2 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <span className="text-white/40 text-xs">📦</span>
                  <span className="text-white font-mono text-sm font-semibold">Track_Name.zip</span>
                </div>
                <div className="p-5 font-mono text-sm space-y-1">
                  {[
                    { i: 0, icon: "📂", name: "Mastered",                                     badge: "" },
                    { i: 1, icon: "🎵", name: "Track_Name_Mastered.wav",                      badge: "" },
                    { i: 1, icon: "🎵", name: "Track_Name_Mastered.mp3",                      badge: "" },
                    { i: 1, icon: "🎵", name: "Track_Name_Radio_Edit.mp3",                    badge: "optional" },
                    { i: 0, icon: "📂", name: "Unmastered",                                   badge: "" },
                    { i: 1, icon: "🎵", name: "Track_Name_Unmastered.wav",                    badge: "" },
                    { i: 1, icon: "🎵", name: "Track_Name_Instrumental.wav",                  badge: "if vocals" },
                    { i: 0, icon: "📂", name: "Stems",                                        badge: "" },
                    { i: 1, icon: "🎵", name: "Kick.wav / Snare.wav / Bass.wav / Lead.wav",   badge: "" },
                    { i: 0, icon: "📂", name: "MIDI",                                         badge: "" },
                    { i: 1, icon: "🎹", name: "Track_Name_Lead.mid / Track_Name_Chords.mid",  badge: "" },
                    { i: 0, icon: "📂", name: "Vocals",                                       badge: "" },
                    { i: 1, icon: "📄", name: "Full_Lyrics.pdf",                              badge: "AI & exclusive" },
                    { i: 0, icon: "📂", name: "DAW_Project",                                  badge: "optional" },
                    { i: 1, icon: "📄", name: "Main_Project_File (.flp / .als / .logicx)",   badge: "" },
                    { i: 1, icon: "📂", name: "Required_Sound_Assets",                        badge: "" },
                  ].map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2" style={{ paddingLeft: row.i * 20 }}>
                      <span className="text-white/25 select-none">{row.i > 0 ? "┗" : "┣"}</span>
                      <span className="text-white/25 text-xs">{row.icon}</span>
                      <span className={row.i === 0 ? "text-white font-semibold" : "text-white/60"}>{row.name}</span>
                      {row.badge && (
                        <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                          style={row.badge === "if vocals"
                            ? { background: "rgba(234,179,8,0.2)", color: "#fde047" }
                            : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }
                          }>{row.badge}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* SUPPORTED DAWs */}
            <Section id="supported-daws" title="Supported DAWs & Technical Disclosure">
              <p className="text-foreground/60 text-sm leading-relaxed mb-5">
                If you choose to include a project file, it must originate from one of the following industry-standard DAWs. You must also provide accurate OS version, DAW version, and third-party plugin list in the submission form.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                {[["Ableton Live",".als"],["FL Studio",".flp"],["Logic Pro",".logicx"],["Pro Tools",".ptx"],["Cubase",".cpr"],["Studio One",".song"]].map(([daw, ext]) => (
                  <div key={daw} className={CARD_CLS} style={{ ...CARD, padding: "16px 20px" }}>
                    <div className="text-white font-semibold text-sm">{daw}</div>
                    <div className="text-white/35 font-mono text-xs mt-1">{ext}</div>
                  </div>
                ))}
              </div>
              <AlertWarn>
                <strong className="text-foreground font-semibold">You are responsible for accuracy.</strong>{" "}
                <span className="text-foreground/60">Providing false DAW details that prevent a buyer from opening the project will result in a refund and potential account suspension.</span>
              </AlertWarn>
            </Section>

            {/* MUSIC QUALITY */}
            <Section id="music-quality" title="Music Quality & Track Requirements">
              <p className="text-foreground/60 text-sm leading-relaxed mb-5">
                GhostBus maintains rigorous quality control to protect buyers and uphold our premium marketplace reputation.
              </p>
              <div className="space-y-2 mb-6">
                {[
                  [true,  "Tracks must be fully original — no unauthorized samples, copyrighted loops, or pre-made melodic pack loops"],
                  [true,  "Mixes must be professional, polished, and commercial-release ready"],
                  [true,  "Arrangements must be complete — intro, build-up, breakdown, drop, and outro appropriate to the genre"],
                  [true,  "Master channels must not exceed 0dBFS — maintain at least −0.1 dB headroom to prevent clipping"],
                  [true,  "Stems must be properly labeled and exported in sync with the mastered mix"],
                  [false, "No unfinished, rough, or sketch-quality productions — only polished, release-ready music"],
                  [false, "No tracks that were previously released or sold elsewhere"],
                  [false, "No AI-generated melodic content (chords, basslines, leads) — triggers immediate account suspension"],
                ].map(([ok, text], i) => (
                  <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl border`}
                    style={{ background: "#000019", borderColor: ok ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.2)" }}>
                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${ok ? "bg-white/10" : "bg-red-500/15"}`}>
                      {ok ? <Check className="w-3 h-3 text-white/70" /> : <X className="w-3 h-3 text-red-400" />}
                    </div>
                    <span className="text-white/70 text-sm leading-relaxed">{text as string}</span>
                  </div>
                ))}
              </div>
              <h3 className="text-foreground font-semibold text-sm mb-3 uppercase tracking-widest opacity-50">Vocal Requirement</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { title: "Royalty-Free Vocals", sub: "Permitted · Must Disclose", body: "Provide the exact sample pack name and direct URL (e.g. Splice, Loopcloud).", ok: true },
                  { title: "Exclusive Vocals",    sub: "Fully Exclusive",           body: "Recorded specifically for this track. Rights transfer to buyer. Vocal stems + Full Lyrics PDF required.", ok: true },
                  { title: "AI-Generated Vocals", sub: "Permitted · Strict Disclosure", body: "Label as 'AI Vocal', provide AI tool name & URL (e.g. Suno, Udio). Full Lyrics PDF mandatory.", ok: true },
                  { title: "Copyrighted Vocals",  sub: "Not Allowed",              body: "Any vocal not covered by royalty-free or exclusive license results in immediate rejection.", ok: false },
                ].map((v) => (
                  <div key={v.title} className={`p-5 rounded-xl border`}
                    style={{ background: "#000019", borderColor: v.ok ? "rgba(255,255,255,0.10)" : "rgba(239,68,68,0.3)" }}>
                    <div className="text-[10px] font-bold tracking-widest uppercase mb-1"
                      style={{ color: v.ok ? "rgba(255,255,255,0.30)" : "rgba(239,68,68,0.8)" }}>{v.sub}</div>
                    <div className="text-white font-semibold text-sm mb-1.5">{v.title}</div>
                    <div className="text-white/50 text-xs leading-relaxed">{v.body}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* VOCALS */}
            <Section id="vocals" title="Vocal Classifications & Rules">
              <p className="text-foreground/60 text-sm leading-relaxed mb-4">
                GhostBus requires absolute transparency regarding vocal assets to ensure buyer legal safety.
              </p>
              <AlertWarn>
                <strong className="text-foreground font-semibold">False vocal information is a serious violation.</strong>{" "}
                <span className="text-foreground/60">If incorrect vocal type is selected or required details are missing, the buyer is entitled to initiate a refund. Repeated violations may result in account suspension.</span>
              </AlertWarn>
            </Section>

            {/* MELODIC SAMPLES */}
            <Section id="melodic-samples" title="Melodic Samples & Instrumental Type">
              <p className="text-foreground/60 text-sm leading-relaxed mb-5">
                Accurate categorization protects both your seller rating and the buyer's publishing rights on GhostBus.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                {[
                  { label: "Semi-Original", body: "Select this if your track utilizes any third-party melodic samples — guitar loops, piano phrases, string riffs. Percussion and SFX do not trigger this requirement." },
                  { label: "Original",      body: "Select this only if 100% of the melodic and harmonic content was synthesized, recorded, or programmed via MIDI entirely from scratch." },
                ].map((m) => (
                  <div key={m.label} className={`p-5 ${CARD_CLS}`} style={CARD}>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-2">{m.label}</div>
                    <p className="text-white/60 text-sm leading-relaxed">{m.body}</p>
                  </div>
                ))}
              </div>
              <AlertWarn>
                <strong className="text-foreground font-semibold">Mislabeling Semi-Original as Original</strong>{" "}
                <span className="text-foreground/60">entitles the buyer to a full refund and puts your GhostBus account at risk.</span>
              </AlertWarn>
            </Section>

            {/* TRACK METADATA */}
            <Section id="track-metadata" title="Track Metadata & SEO Optimization">
              <p className="text-foreground/60 text-sm leading-relaxed mb-5">
                Accurate metadata drives internal search visibility on GhostBus and converts listeners into buyers.
              </p>
              <div className={`${CARD_CLS} overflow-hidden`} style={CARD}>
                <div className="grid grid-cols-[1.5fr_auto_2fr] text-[10px] font-bold tracking-widest uppercase px-5 py-3 gap-4 border-b"
                  style={{ color: "rgba(255,255,255,0.35)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <span>Data Field</span><span>Requirement</span><span>Optimization Strategy</span>
                </div>
                {[
                  ["Track Title",       "required",  "Clear and descriptive. No artist, label, or trademarked names."],
                  ["Genre",             "required",  "Select the most accurate primary genre."],
                  ["BPM & Key",         "required",  "Provide exact BPM and musical key (e.g. 124 BPM, A Minor)."],
                  ["Description",       "required",  "Focus on energy, venue fit, and sonic characteristics. Avoid keyword stuffing."],
                  ["DAW Used",          "required",  "Clearly state the software for project file compatibility."],
                  ["Vocal Source Link", "if-vocals", "Mandatory only if royalty-free sample pack vocals are used."],
                  ["Tags",              "optional",  "Use descriptive genre keywords, vibe metrics, and style comparisons."],
                ].map(([field, req, notes]) => (
                  <div key={field} className="grid grid-cols-[1.5fr_auto_2fr] items-start gap-4 px-5 py-3.5 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <span className="text-white text-sm font-medium">{field}</span>
                    <Badge status={req} />
                    <span className="text-white/45 text-xs leading-relaxed">{notes}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* ARTWORK */}
            <Section id="artwork" title="Premium Track Artwork">
              <p className="text-foreground/60 text-sm leading-relaxed mb-5">
                Your cover art is the primary visual hook. Substandard artwork will be rejected by the GhostBus QA team.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Dimensions",        body: "Minimum 500×500px · Exact 1:1 square ratio" },
                  { title: "Format & Color",    body: "High-quality JPG/JPEG · RGB Color Mode" },
                  { title: "Visual Guidelines", body: "Original or licensed imagery only. Abstract and atmospheric themes perform best." },
                  { title: "Restrictions",      body: "No watermarks, no identifiable people without consent, no explicit content, no third-party logos." },
                ].map((a) => (
                  <div key={a.title} className={`p-5 ${CARD_CLS}`} style={CARD}>
                    <div className="text-white font-semibold text-sm mb-2">{a.title}</div>
                    <div className="text-white/50 text-xs leading-relaxed">{a.body}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* PRICING */}
            <Section id="pricing" title="Professional Pricing Tiers">
              <p className="text-foreground/60 text-sm leading-relaxed mb-5">
                Pricing dictates your target audience on GhostBus. Sellers retain between 72% (New Seller) and 85% (Legend) of the final sale price.
              </p>
              <div className={`${CARD_CLS} overflow-hidden`} style={CARD}>
                <div className="grid grid-cols-[1fr_2fr] text-[10px] font-bold tracking-widest uppercase px-5 py-3 gap-4 border-b"
                  style={{ color: "rgba(255,255,255,0.35)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <span>Price Range</span><span>Production Tier & Buyer Expectation</span>
                </div>
                {[
                  ["€149 – €399",    "Competent, standard productions. Ideal for building platform history."],
                  ["€400 – €699",    "Polished, professional tracks with strong sound design."],
                  ["€700 – €999",    "Advanced productions optimised for club and festival formats."],
                  ["€1,000 – €1,500","Premium, label-ready releases with distinct artistic merit."],
                  ["€1,500 – €2,000","Elite productions featuring exclusive vocals and cutting-edge sound design."],
                ].map(([range, desc], i) => (
                  <div key={range} className="grid grid-cols-[1fr_2fr] items-start gap-4 px-5 py-4 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.06)", background: i === 4 ? "rgba(255,255,255,0.04)" : undefined }}>
                    <span className="text-white font-semibold text-sm font-mono">{range}</span>
                    <span className="text-white/55 text-sm leading-relaxed">{desc}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* LEGAL */}
            <Section id="legal" title="Legal, Terms & Account Security">
              <p className="text-foreground/60 text-sm leading-relaxed mb-5">
                By selling on GhostBus, you enter a legally binding agreement to protect the integrity of the ghost production industry.
              </p>
              <div className="space-y-3">
                {[
                  { title: "Complete Ownership",    body: "You guarantee you are the sole creator and hold 100% of the rights to the submitted track." },
                  { title: "Total Exclusivity",     body: "GhostBus retains exclusive hosting and selling rights. You may not distribute, license, or sell the track on any other platform." },
                  { title: "Rights Transfer & NDA", body: "Upon sale, all master, copyright, and neighboring rights transfer permanently to the buyer. You are bound by an NDA and may never publicly claim authorship." },
                  { title: "Marketplace Removal",   body: "Sold tracks are permanently removed from GhostBus and cannot be resold." },
                  { title: "Legal Liability",       body: "You are strictly liable for any copyright infringement claims resulting from unauthorized samples or stolen melodies." },
                  { title: "Identity Verification", body: "GhostBus requires a valid national government-issued ID for payout verification." },
                  { title: "Zero-Tolerance Policy", body: "Fraudulent activity, stolen content, or misrepresentation will result in a permanent ban and potential legal action." },
                ].map((item) => (
                  <div key={item.title} className={`flex items-start gap-4 p-5 ${CARD_CLS}`} style={CARD}>
                    <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: "rgba(255,255,255,0.08)" }}>
                      <Check className="w-3 h-3 text-white/60" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm mb-1">{item.title}</div>
                      <div className="text-white/50 text-xs leading-relaxed">{item.body}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final CTA */}
              <div className={`mt-10 p-8 text-center ${CARD_CLS}`} style={CARD}>
                <h3 className="text-white font-display font-semibold text-xl mb-2">Ready to start selling?</h3>
                <p className="text-white/50 text-sm mb-6">Submit your application today and join our global marketplace of professional ghost producers.</p>
                <Link to="/apply-seller"
                  className="inline-flex h-11 px-7 items-center gap-2 rounded-full bg-white text-[#060226] text-sm font-bold hover:bg-white/90 transition shadow-lg">
                  Apply to Become a Seller <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </Section>

          </main>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-0.5 h-6 rounded-full" style={{ background: "#000019" }} />
        <h2 className="font-display font-bold text-foreground text-2xl tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Badge({ status }: { status: string }) {
  if (status === "required") return (
    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap"
      style={{ background: "#000019" }}>Required</span>
  );
  if (status === "if-vocals") return (
    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
      style={{ background: "rgba(234,179,8,0.15)", color: "#ca8a04" }}>If Vocals</span>
  );
  return (
    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-foreground/40 bg-muted whitespace-nowrap">Optional</span>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 mt-5 p-4 rounded-xl border border-border bg-muted/50">
      <AlertTriangle className="shrink-0 w-4 h-4 mt-0.5 text-muted-foreground" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function AlertWarn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 mt-5 p-4 rounded-xl border border-amber-200 bg-amber-50/60">
      <AlertTriangle className="shrink-0 w-4 h-4 mt-0.5 text-amber-500" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
