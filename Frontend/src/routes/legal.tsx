import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Shield, FileText, Lock, AlertTriangle } from 'lucide-react'

export const Route = createFileRoute('/legal')({
  component: LegalPage,
})

function LegalPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-display">
              Legal Terms & Agreements
            </h1>
            <p className="text-xl text-muted-foreground">
              Master Rights Transfer, Exclusive License, and Confidentiality Agreement
            </p>
          </motion.div>

          {/* Key Points */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Shield, title: 'Full Rights Transfer', desc: '100% ownership to buyer' },
              { icon: FileText, title: 'Legal Protection', desc: 'Binding NDA included' },
              { icon: Lock, title: 'Confidentiality', desc: 'Permanent anonymity' },
              { icon: AlertTriangle, title: 'Breach Penalty', desc: '€50k-€500k damages' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 text-center"
              >
                <item.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agreement Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 space-y-8">
            
            {/* Header */}
            <div className="text-center border-b border-border pb-8">
              <h2 className="text-3xl font-bold mb-4 font-display">GHOSTBUS AUDIO</h2>
              <p className="text-xl text-muted-foreground">
                Master Rights Transfer, Exclusive License, and Confidentiality Agreement
              </p>
            </div>

            {/* 1. Definitions */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary font-display">1. Definitions</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">1.1. "Track"</strong> refers to the fully finished master audio recording, the underlying musical composition, arrangement, melodies, lyrics (if applicable), individual multi-track stems, MIDI files, and the native Digital Audio Workstation (DAW) project file.
                </p>
                <p>
                  <strong className="text-foreground">1.2. "Ghost Production"</strong> refers to an arrangement wherein the original creator of a musical work transfers all ownership, attribution, and copyrights to a third party in exchange for financial compensation, agreeing to remain permanently anonymous.
                </p>
                <p>
                  <strong className="text-foreground">1.3. "Platform"</strong> refers to GHOSTBUS AUDIO, acting solely as the technological and administrative intermediary facilitating the licensing, financial transaction, and delivery of the Track.
                </p>
              </div>
            </div>

            {/* 2. Grant of License */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary font-display">2. Grant of License & Absolute Transfer of Rights</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">2.1. Total Assignment:</strong> Producer hereby sells, assigns, and transfers to Licensee an exclusive, perpetual, irrevocable, worldwide, and unrestricted right, title, and interest in and to the Track. This includes, but is not limited to, the master recording copyright (sound recording), the underlying musical composition copyright (publishing), songwriting rights, and all neighboring and mechanical rights.
                </p>
                <p>
                  <strong className="text-foreground">2.2. Work-for-Hire Designation:</strong> Upon full payment, all ownership rights, copyrights, neighboring rights, and commercial exploitation rights are irrevocably assigned to the Licensee.
                </p>
                <p>
                  <strong className="text-foreground">2.3. Right of Paternity and Moral Rights Waiver:</strong> To the fullest extent permitted by applicable law, the Producer explicitly and irrevocably waives all "moral rights" (droit moral) or equivalent rights of authorship. The Producer grants the Licensee the absolute right to release, market, distribute, and commercially exploit the Track under the Licensee's own name, professional alias, brand, or project name, presenting themselves to the public as the sole original creator and owner.
                </p>
                <p>
                  <strong className="text-foreground">2.4. Third-Party Registration:</strong> The Licensee is fully authorized to register the Track with any Performing Rights Organization (PRO) (e.g., ASCAP, BMI, PRS, GEMA), copyright office, digital distributor, label, or publishing administrator as the sole writer, composer, and master owner, without requiring further consent from the Producer.
                </p>
              </div>
            </div>

            {/* 3. Originality & Production Warranties */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary font-display">3. Originality & Production Warranties</h3>
              <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6 mb-4">
                <p className="text-destructive font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  CRITICAL: A breach of any condition below renders the transaction fraudulent
                </p>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">3.1. Sole Authorship:</strong> The Producer warrants they are the sole, exclusive creator and owner of the Track. The Track is an original creation built entirely from scratch, is not a collaboration, and does not infringe upon any third-party intellectual property.
                </p>
                <p>
                  <strong className="text-foreground">3.2. Prohibited Elements (No AI or Kits):</strong> The Producer expressly guarantees that no artificial intelligence generation tools (e.g., Suno, Udio), commercial construction kits, unmodified pre-made melodies/MIDI files, or full project templates were utilized in the creation of the core composition.
                </p>
                <p>
                  <strong className="text-foreground">3.3. Sample Clearance:</strong> Any third-party drum samples, one-shots, sound effects, or vocal recordings utilized within the Track are covered by valid, royalty-free, commercial-use licenses allowing for unrestricted global resale and sub-licensing without attribution.
                </p>
                <p>
                  <strong className="text-foreground">3.4. Prior Publication Prohibition:</strong> The Producer guarantees the Track (or any distinct identifiable element thereof) has never been previously published, distributed, broadcast, or monetized on any platform, including but not limited to Spotify, Apple Music, SoundCloud, Beatport, YouTube, Instagram Stories, TikTok, or live streams.
                </p>
              </div>
            </div>

            {/* 4. Strict Confidentiality */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary font-display">4. Strict Confidentiality & Permanent Anonymity</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">4.1. Irreversible Anonymity:</strong> The Producer acknowledges and agrees that the choice to sell the Track as a Ghost Production via GHOSTBUS AUDIO is permanent and irreversible. The Producer shall never claim public or private credit as the author, producer, co-producer, mixing engineer, or mastering engineer of the Track.
                </p>
                <p>
                  <strong className="text-foreground">4.2. Non-Disclosure:</strong> Both parties agree to maintain absolute confidentiality regarding the terms of this transaction, the identity of the counterparty, and the origins of the Track.
                </p>
                <div className="bg-warning/10 border border-warning/30 rounded-2xl p-6">
                  <p className="text-warning font-semibold mb-2">
                    💰 4.3. Liquidated Damages for Breach of Anonymity:
                  </p>
                  <p className="text-muted-foreground">
                    Any public or verifiable claim of authorship by the Producer will result in a mandatory liquidated damages penalty of a minimum of <strong className="text-foreground">€50,000 EUR</strong> (Fifty Thousand Euros), up to a maximum of <strong className="text-foreground">€500,000 EUR</strong> (Five Hundred Thousand Euros), depending on the scale of commercial exposure and damages caused.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Delivery of Files */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary font-display">5. Delivery of Files & Technical Support</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">5.2. Mandatory Inclusions:</strong> The Producer guarantees the delivery package contains:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fully Mastered uncompressed audio file (24-bit/44.1kHz WAV minimum)</li>
                  <li>Unmastered / Pre-master mixdown audio file (WAV format)</li>
                  <li>Complete Multi-track Stems (individual rendered, labeled audio tracks)</li>
                  <li>Comprehensive MIDI files for all core melodic, harmonic, and bass elements</li>
                  <li>The complete native DAW Project File (e.g., FL Studio .flp)</li>
                </ul>
                <p>
                  <strong className="text-foreground">5.3. File Retention & Support:</strong> The Producer is obligated to securely back up and retain all associated production files for a minimum period of one (1) year following the transaction date.
                </p>
              </div>
            </div>

            {/* 6. Payment Terms */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary font-display">6. Payment Terms & Platform Administration</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">6.1. Full Consideration:</strong> The Licensee agrees to pay the total fixed purchase price displayed on GHOSTBUS AUDIO at checkout. This constitutes a one-time, non-refundable buyout fee granting perpetual, exclusive ownership. No ongoing royalties, backend percentages, or sync splits are owed to the Producer.
                </p>
                <p>
                  <strong className="text-foreground">6.2. Platform Fees & Payouts:</strong> The Producer authorizes GHOSTBUS AUDIO to collect funds from the Licensee, deduct applicable platform commissions, and remit the remaining balance to the Producer's designated payout account.
                </p>
              </div>
            </div>

            {/* 7. Indemnification */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary font-display">7. Indemnification & Limitation of Liability</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">7.1. Producer Indemnification:</strong> The Producer agrees to defend, indemnify, and hold harmless the Licensee, GHOSTBUS AUDIO, its directors, employees, and third-party distribution partners from and against any and all claims, lawsuits, liabilities, financial losses, damages, and legal expenses arising out of any breach of warranties or copyright infringement.
                </p>
                <p>
                  <strong className="text-foreground">7.3. Finality of Sale:</strong> Once ownership is formally transferred and files are accessed by the Licensee, the transaction is definitive, absolute, and non-refundable.
                </p>
              </div>
            </div>

            {/* 8. Governing Law */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary font-display">8. Governing Law & General Provisions</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">8.4. Electronic Execution:</strong> By checking the acceptance box, digitally signing, or completing the secure checkout workflow on www.ghostbusaudio.com, both the Producer and the Licensee confirm they have thoroughly read, understood, and legally bound themselves to the execution of this Agreement.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="border-t border-border pt-8 text-center">
              <p className="text-muted-foreground">
                Platform Intermediary: <strong className="text-foreground">GHOSTBUS AUDIO</strong>
              </p>
              <p className="text-muted-foreground">
                Contact: <a href="mailto:info.ghostbus@gmail.com" className="text-primary hover:underline">info.ghostbus@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
