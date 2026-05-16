import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/faq')({
  component: FAQPage,
})

const buyerFAQs = [
  {
    question: 'How do I buy a ghost produced track?',
    answer: `Buying a track on GHOSTBUS is simple and fully secure:
    
1. Browse the Marketplace using advanced filters such as genre, BPM, key, DAW, mood, or price.
2. Preview the track directly on the platform.
3. Complete checkout using your preferred payment method.
4. Instantly download the complete production package.
5. Receive full ownership rights, legal documentation, and NDA protection.
6. Release the track worldwide under your own artist name.`
  },
  {
    question: 'What do I receive after purchasing a track?',
    answer: `Every purchase includes a professional release package:

INCLUDED FILES:
• Mastered WAV File
• High Quality MP3
• Unmastered Mixdown
• Instrumental Version
• Individual Audio Stems
• MIDI Files
• DAW Project File (if included by producer)
• Rights Transfer Documentation
• NDA & Ownership Certificate`
  },
  {
    question: 'Is there a guarantee that the track I buy is exclusive?',
    answer: `Yes. Every track on GHOSTBUS is sold only once.

Once purchased, the track is permanently removed from the marketplace and can never be sold again. Buyers receive complete exclusivity and ownership rights.`
  },
  {
    question: 'How does ghost production work?',
    answer: `Ghost production is a professional industry service where a producer creates music anonymously for another artist, DJ, or label.

After purchase:
• Full ownership rights transfer to the buyer
• The producer remains confidential
• The buyer releases the track under their own name
• All royalties belong to the buyer`
  },
  {
    question: 'Do I own the music after purchase?',
    answer: `Yes. Buyers receive full commercial ownership rights after purchase.

This includes:
• Copyright Ownership
• Master Rights
• Commercial Usage Rights
• Streaming Monetization Rights
• Distribution Rights
• Performance Rights

All legal information is documented through our Rights Transfer & NDA System.`
  },
  {
    question: 'How can I make money with ghost produced tracks?',
    answer: `Once purchased, you can monetize the track across all major platforms:

SUPPORTED PLATFORMS:
• Spotify
• Apple Music
• Beatport
• YouTube
• SoundCloud
• TikTok
• Amazon Music
• Traxsource
• TIDAL
• Bandcamp

You keep:
• 100% Streaming Revenue
• Download Revenue
• Performance Royalties
• Sync Licensing Revenue
• Radio & Broadcast Revenue`
  },
  {
    question: 'Do you offer any guarantees on the quality of the tracks?',
    answer: `Yes. Every track uploaded to GHOSTBUS undergoes a professional review process before approval.

Our quality control includes:
• Mix & Master Review
• Commercial Loudness Standards
• Originality Verification
• Streaming Platform Compatibility
• Technical Audio Inspection

Tracks are designed to meet modern industry standards for clubs, festivals, streaming services, and commercial releases.`
  },
  {
    question: 'Are there any hidden fees?',
    answer: `No. GHOSTBUS operates with transparent pricing.

The amount shown during checkout is the final amount you pay unless taxes or payment provider fees apply in your country.

There are:
• No royalty splits
• No recurring fees
• No hidden ownership costs
• No subscription requirements for buyers`
  },
  {
    question: 'Can I contact the producer after I purchase a track?',
    answer: `In most cases, producers remain anonymous under NDA protection.

However, for certain purchases or custom projects, communication may be possible through the GHOSTBUS support system while maintaining confidentiality.`
  },
  {
    question: 'Is my purchase secure?',
    answer: `Yes. GHOSTBUS uses secure encrypted checkout systems and protected account infrastructure.

Supported payment methods may include:
• Credit & Debit Cards
• PayPal
• Apple Pay
• Google Pay
• Bank Transfer

All purchases and downloads are securely processed and protected.`
  },
  {
    question: 'Do you offer refunds?',
    answer: `Due to the digital and exclusive nature of ghost production products, completed purchases are generally non-refundable.

However, if there is a verified technical issue or file delivery problem, our support team will work to resolve it immediately.`
  },
  {
    question: 'Are there any discounts or promotions?',
    answer: `Yes. GHOSTBUS may offer:
• Promotional Campaigns
• Seasonal Discounts
• Coupon Codes
• Limited-Time Offers
• Ghost Coins Rewards`
  },
  {
    question: 'What are Ghost Coins?',
    answer: `Ghostbus Coins are platform reward credits that can be used toward future purchases, discounts, promotions, or exclusive marketplace benefits.`
  },
]

const sellerFAQs = [
  {
    question: 'How do I start selling on GHOSTBUS?',
    answer: `Getting started is simple:

1. Create your producer account
2. Complete the Producer Verification & Seller Application
3. Wait for approval (2-3 business days)
4. Complete identity verification
5. Upload your tracks
6. Set your price
7. Start earning!`
  },
  {
    question: 'What commission levels are available?',
    answer: `Commission levels increase with your total sales:

• BRONZE (Starting) → 72% Commission
• SILVER (€5,000 Total Sales) → 75% Commission
• GOLD (€10,000 Total Sales) → 78% Commission
• PLATINUM (€30,000 Total Sales) → 82% Commission
• DIAMOND (€50,000 Total Sales) → 85% Commission

Once achieved, levels remain permanently unlocked.`
  },
  {
    question: 'How long does track approval take?',
    answer: `Track reviews are typically completed within 72 hours during working days.

Our team reviews:
• Audio Quality
• Originality
• Commercial Potential
• Technical Standards`
  },
  {
    question: 'How do I get paid?',
    answer: `Request payouts through:
• PayPal
• Payoneer

Most payouts are processed within 24 hours after approval.`
  },
  {
    question: 'What files do I need to upload?',
    answer: `You must upload:
• Mastered WAV
• Unmastered Mixdown
• Stems
• MIDI Files
• Optional DAW Project File`
  },
]

function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [openSellerIndex, setOpenSellerIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-center mb-6 font-display"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground text-center"
          >
            Professional answers for buyers, artists, labels, DJs, and producers using the GHOSTBUS marketplace.
          </motion.p>
        </div>
      </section>

      {/* For Buyers Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-8 text-primary font-display"
          >
            FOR BUYERS
          </motion.h2>
          <div className="space-y-4">
            {buyerFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-2xl overflow-hidden bg-card"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-4"
                  >
                    <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Sellers Section */}
      <section className="py-16 px-4 bg-surface">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-8 text-primary font-display"
          >
            FOR SELLERS
          </motion.h2>
          <div className="space-y-4">
            {sellerFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-2xl overflow-hidden bg-card"
              >
                <button
                  onClick={() => setOpenSellerIndex(openSellerIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      openSellerIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSellerIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-4"
                  >
                    <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-accent rounded-2xl p-8 border border-border"
          >
            <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our support team is available for technical assistance, purchase support, seller questions, rights & licensing help, payment issues, and custom production requests.
            </p>
            <a
              href="mailto:info.ghostbus@gmail.com"
              className="inline-block px-8 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full font-semibold transition-colors shadow-lift"
            >
              Contact Support
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
