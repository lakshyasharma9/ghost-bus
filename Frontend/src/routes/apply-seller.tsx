import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { AlertTriangle, CheckCircle2, Pen, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/apply-seller')({
  component: ApplySellerPage,
})

function ApplySellerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    artistAlias: '',
    labelName: '',
    country: '',
    address: '',
    phone: '',
    altPhone: '',
    email: '',
    spotify: '',
    instagram: '',
    soundcloud: '',
    youtube: '',
    otherLinks: '',
    
    // Verification Questions
    soleCreator: '',
    everUploaded: '',
    everUploadedDetails: '',
    usedAI: '',
    usedAIDetails: '',
    samplesLicensed: '',
    canProvideFiles: '',
    understandAnonymity: '',
    copyrightStrikes: '',
    copyrightStrikesDetails: '',
    acknowledgeFraud: '',
    labelQuality: '',
    whyJoin: '',
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set drawing style
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasSignature(true)

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasSignature) {
      alert('Please provide your digital signature before submitting.')
      return
    }

    console.log('Form submitted:', formData)
    alert('Application submitted! Our team will review within 2-3 business days.')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Warning Banner */}
      <div className="bg-destructive/10 border-b border-destructive/30 py-4 px-4">
        <div className="container mx-auto max-w-5xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">
            <strong className="font-semibold">IMPORTANT NOTICE:</strong> GHOSTBUS AUDIO operates under strict professional ghost production standards. Fraudulent submissions, AI-generated instrumentals, stolen compositions, unauthorized samples, resold tracks, template-based productions, or misleading information will result in permanent rejection, account termination, payment holds, legal escalation, and marketplace blacklisting.
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-display">
              Producer Verification & Seller Application
            </h1>
            <p className="text-xl text-muted-foreground">
              Only serious producers with fully original and unreleased work should apply.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Applicant Identification */}
            <div className="bg-card border border-border rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-primary font-display">APPLICANT IDENTIFICATION</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Artist Name / Producer Alias *</label>
                  <input
                    type="text"
                    required
                    value={formData.artistAlias}
                    onChange={(e) => setFormData({ ...formData, artistAlias: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Record Label Name (if applicable)</label>
                  <input
                    type="text"
                    value={formData.labelName}
                    onChange={(e) => setFormData({ ...formData, labelName: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Full Residential Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Contact Phone Number (Including + Country Code) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Example: (+00) 00000 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Alternative Phone Number</label>
                  <input
                    type="tel"
                    value={formData.altPhone}
                    onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Primary Business Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Social & Professional Links</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Spotify Artist Profile</label>
                    <input
                      type="url"
                      value={formData.spotify}
                      onChange={(e) => setFormData({ ...formData, spotify: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Instagram Profile</label>
                    <input
                      type="url"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">SoundCloud Profile</label>
                    <input
                      type="url"
                      value={formData.soundcloud}
                      onChange={(e) => setFormData({ ...formData, soundcloud: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">YouTube Channel</label>
                    <input
                      type="url"
                      value={formData.youtube}
                      onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Additional Professional Links (Beatport / LabelRadar / Website / etc.)</label>
                    <textarea
                      rows={3}
                      value={formData.otherLinks}
                      onChange={(e) => setFormData({ ...formData, otherLinks: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Producer Authenticity & Rights Verification */}
            <div className="bg-card border border-border rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-primary font-display">PRODUCER AUTHENTICITY & RIGHTS VERIFICATION</h2>
              <div className="space-y-6">
                
                <div>
                  <label className="block text-sm font-semibold mb-3">Are you the sole creator, composer, arranger, sound designer, mixing engineer, and copyright owner of every submitted track? *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="soleCreator" value="YES" required onChange={(e) => setFormData({ ...formData, soleCreator: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>YES</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="soleCreator" value="NO" required onChange={(e) => setFormData({ ...formData, soleCreator: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>NO</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Have you EVER uploaded, previewed, distributed, livestreamed, pitched, sold, or publicly shared these tracks in any form before submission? *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="everUploaded" value="YES" required onChange={(e) => setFormData({ ...formData, everUploaded: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>YES</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="everUploaded" value="NO" required onChange={(e) => setFormData({ ...formData, everUploaded: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>NO</span>
                    </label>
                  </div>
                  {formData.everUploaded === 'YES' && (
                    <textarea
                      rows={3}
                      placeholder="If YES, explain in detail:"
                      value={formData.everUploadedDetails}
                      onChange={(e) => setFormData({ ...formData, everUploadedDetails: e.target.value })}
                      className="w-full mt-3 px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Did you use ANY AI-generated melodies, harmonies, instrumentals, MIDI generations, construction kits, templates, or recreated copyrighted compositions in your submitted tracks? *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="usedAI" value="YES" required onChange={(e) => setFormData({ ...formData, usedAI: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>YES</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="usedAI" value="NO" required onChange={(e) => setFormData({ ...formData, usedAI: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>NO</span>
                    </label>
                  </div>
                  {formData.usedAI === 'YES' && (
                    <textarea
                      rows={3}
                      placeholder="If YES, explain EXACTLY what was used:"
                      value={formData.usedAIDetails}
                      onChange={(e) => setFormData({ ...formData, usedAIDetails: e.target.value })}
                      className="w-full mt-3 px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Are all vocals, one-shots, loops, presets, and samples used in your productions commercially licensed and legally resellable for ghost production purposes? *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="samplesLicensed" value="YES" required onChange={(e) => setFormData({ ...formData, samplesLicensed: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>YES</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="samplesLicensed" value="NO" required onChange={(e) => setFormData({ ...formData, samplesLicensed: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>NO</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Can you provide FULL project files, stems, MIDI, exported renders, and proof-of-production timestamps upon request? *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="canProvideFiles" value="YES" required onChange={(e) => setFormData({ ...formData, canProvideFiles: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>YES</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="canProvideFiles" value="NO" required onChange={(e) => setFormData({ ...formData, canProvideFiles: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>NO</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Do you understand that once a track is sold under GHOSTBUS AUDIO ghost production terms, you permanently lose the right to publicly claim ownership, authorship, or involvement with the sold work? *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="understandAnonymity" value="YES" required onChange={(e) => setFormData({ ...formData, understandAnonymity: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>YES</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="understandAnonymity" value="NO" required onChange={(e) => setFormData({ ...formData, understandAnonymity: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>NO</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Have you ever received copyright strikes, takedowns, fraud reports, or ghost production disputes on any platform or marketplace? *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="copyrightStrikes" value="YES" required onChange={(e) => setFormData({ ...formData, copyrightStrikes: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>YES</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="copyrightStrikes" value="NO" required onChange={(e) => setFormData({ ...formData, copyrightStrikes: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>NO</span>
                    </label>
                  </div>
                  {formData.copyrightStrikes === 'YES' && (
                    <textarea
                      rows={3}
                      placeholder="If YES, explain why:"
                      value={formData.copyrightStrikesDetails}
                      onChange={(e) => setFormData({ ...formData, copyrightStrikesDetails: e.target.value })}
                      className="w-full mt-3 px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Do you acknowledge that fraudulent submissions, undisclosed AI usage, stolen compositions, or unauthorized samples may result in legal liability, buyer claims, financial damages, penalties, permanent bans, and industry blacklisting? *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="acknowledgeFraud" value="YES" required onChange={(e) => setFormData({ ...formData, acknowledgeFraud: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>YES</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="acknowledgeFraud" value="NO" required onChange={(e) => setFormData({ ...formData, acknowledgeFraud: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>NO</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Are you capable of consistently delivering industry-standard, label-quality productions suitable for commercial release platforms such as Spotify, Beatport, Apple Music, and major record labels? *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="labelQuality" value="YES" required onChange={(e) => setFormData({ ...formData, labelQuality: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>YES</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="labelQuality" value="NO" required onChange={(e) => setFormData({ ...formData, labelQuality: e.target.value })} className="w-4 h-4 text-primary" />
                      <span>NO</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Why do you want to join GHOSTBUS AUDIO, and what makes your productions commercially valuable and trustworthy compared to other applicants? *</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.whyJoin}
                    onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Track Submissions */}
            <div className="bg-card border border-border rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-primary font-display">UNRELEASED TRACK SUBMISSION PORTAL</h2>
              <p className="text-muted-foreground mb-8">Upload your top 3 unreleased tracks for review</p>
              
              {[1, 2, 3].map((num) => (
                <div key={num} className="mb-8 pb-8 border-b border-border last:border-b-0">
                  <h3 className="text-lg font-semibold mb-4">TRACK #{num}</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Title *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Genre *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">BPM *</label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Project File Available? *</label>
                      <div className="flex gap-4 mt-3">
                        <label className="flex items-center gap-2">
                          <input type="radio" name={`track${num}ProjectFile`} value="YES" required className="w-4 h-4 text-primary" />
                          <span>YES</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" name={`track${num}ProjectFile`} value="NO" required className="w-4 h-4 text-primary" />
                          <span>NO</span>
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Private Streaming Link *</label>
                      <input
                        type="url"
                        required
                        placeholder="SoundCloud private link, Google Drive, etc."
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Download Link *</label>
                      <input
                        type="url"
                        required
                        placeholder="Google Drive, Dropbox, WeTransfer, etc."
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legal Declaration */}
            <div className="bg-accent border border-border rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-primary font-display">LEGAL DECLARATION & PRODUCER CONFIRMATION</h2>
              <div className="space-y-3 text-sm text-muted-foreground mb-6">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  All information provided is accurate and truthful.
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  I am the legal rights holder of all submitted material.
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  None of the submitted tracks are stolen, leaked, AI-generated instrumentals, or illegally recreated works.
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  I understand that GHOSTBUS AUDIO reserves the right to reject, remove, investigate, or permanently ban any seller at its sole discretion.
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  I understand that sold ghost productions must remain permanently confidential.
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  I agree to comply fully with the platform's seller agreement, exclusivity rules, confidentiality obligations, and copyright transfer conditions.
                </p>
              </div>

              <div className="flex items-start gap-3 mb-6">
                <input type="checkbox" required className="w-5 h-5 mt-1 text-primary" />
                <label className="text-sm">
                  I confirm that I have read, understood, and agree to all terms and conditions stated above. *
                </label>
              </div>

              {/* Digital Signature */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                  <Pen className="w-4 h-4" />
                  Digital Signature *
                </label>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-40 border-2 border-border rounded-xl bg-white cursor-crosshair touch-none"
                    style={{ touchAction: 'none' }}
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-muted-foreground text-sm">Sign here with your cursor or touch</span>
                    </div>
                  )}
                </div>
                {hasSignature && (
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="mt-3 px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Signature
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full font-semibold text-lg transition-all shadow-lift"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
