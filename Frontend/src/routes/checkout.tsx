import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Trash2, Lock, Shield, Zap,
  CheckCircle2, AlertCircle, ArrowLeft, FileAudio,
  FileArchive, FileText, Music, BadgeCheck,
} from "lucide-react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useCart } from "@/store";
import { useAuthContext } from "@/contexts/AuthContext";
import { paymentAPI } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — GhostBus" }] }),
  component: CheckoutPage,
});

const COUNTRY_CODES = [
  { code: "+1",   country: "US", flag: "🇺🇸" }, { code: "+44",  country: "GB", flag: "🇬🇧" },
  { code: "+49",  country: "DE", flag: "🇩🇪" }, { code: "+33",  country: "FR", flag: "🇫🇷" },
  { code: "+39",  country: "IT", flag: "🇮🇹" }, { code: "+34",  country: "ES", flag: "🇪🇸" },
  { code: "+31",  country: "NL", flag: "🇳🇱" }, { code: "+46",  country: "SE", flag: "🇸🇪" },
  { code: "+47",  country: "NO", flag: "🇳🇴" }, { code: "+45",  country: "DK", flag: "🇩🇰" },
  { code: "+48",  country: "PL", flag: "🇵🇱" }, { code: "+61",  country: "AU", flag: "🇦🇺" },
  { code: "+64",  country: "NZ", flag: "🇳🇿" }, { code: "+55",  country: "BR", flag: "🇧🇷" },
  { code: "+52",  country: "MX", flag: "🇲🇽" }, { code: "+91",  country: "IN", flag: "🇮🇳" },
  { code: "+81",  country: "JP", flag: "🇯🇵" }, { code: "+82",  country: "KR", flag: "🇰🇷" },
  { code: "+65",  country: "SG", flag: "🇸🇬" }, { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+7",   country: "RU", flag: "🇷🇺" }, { code: "+380", country: "UA", flag: "🇺🇦" },
  { code: "+90",  country: "TR", flag: "🇹🇷" }, { code: "+20",  country: "EG", flag: "🇪🇬" },
  { code: "+27",  country: "ZA", flag: "🇿🇦" },
];

function CheckoutPage() {
  const cart = useCart();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [{ isPending: paypalLoading }] = usePayPalScriptReducer();

  const [countryCode,   setCountryCode]   = useState("+1");
  const [phone,         setPhone]         = useState("");
  const [phoneError,    setPhoneError]    = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [processing,    setProcessing]    = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate({ to: "/login?redirect=/checkout" });
    }
  }, [user, navigate]);

  // Redirect to tracks if cart is empty
  useEffect(() => {
    if (cart.items.length === 0 && !processing) {
      navigate({ to: "/tracks" });
    }
  }, [cart.items.length, processing, navigate]);

  const subtotal   = cart.items.reduce((s, i) => s + i.track.price, 0);
  const serviceFee = Math.round(subtotal * 0.03 * 100) / 100;
  const total      = subtotal + serviceFee;

  const validatePhone = (val: string) => {
    if (!val) return "Phone number is required";
    if (!/^\d+$/.test(val)) return "Numbers only — no spaces or dashes";
    if (val.length < 7)  return "Phone number is too short";
    if (val.length > 15) return "Phone number is too long";
    return "";
  };

  const createPayPalOrder = async () => {
    const { data } = await paymentAPI.createPayPalOrder({
      items: cart.items.map((i) => ({ trackId: i.track.id })),
      buyerPhone: phone,
      countryCode,
    });
    return data.data.paypalOrderId;
  };

  const onApprove = async (paypalData: { orderID: string }) => {
    setProcessing(true);
    try {
      await paymentAPI.capturePayPalOrder(paypalData.orderID);
      cart.clear();
      toast.success("Payment successful! Your files are ready to download.");
      navigate({ to: "/account/orders" });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Payment failed. Please try again.";
      toast.error(msg);
      setProcessing(false);
    }
  };

  const canPay = termsAccepted && !validatePhone(phone) && !processing;

  if (!user || cart.items.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container-app h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#060226] to-[#1a0a5e] grid place-items-center text-white font-bold text-sm">G</div>
            <span className="font-semibold tracking-tight text-[17px]">GhostBus</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-green-500" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="container-app py-8 md:py-12">
        {/* Back link */}
        <button
          onClick={() => navigate({ to: "/tracks" })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue shopping
        </button>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">

          {/* ── LEFT: Order Summary ── */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Order Summary</h1>
              <p className="text-muted-foreground text-sm mt-1">{cart.items.length} exclusive track{cart.items.length > 1 ? "s" : ""} · Full rights included</p>
            </div>

            {/* Track cards */}
            <div className="space-y-4">
              {cart.items.map(({ track }) => (
                <motion.div
                  key={track.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-card border border-border rounded-2xl p-4 md:p-5"
                >
                  <div className="flex gap-4">
                    {/* Artwork */}
                    <div
                      className="w-20 h-20 md:w-24 md:h-24 rounded-xl shrink-0 bg-cover bg-center bg-muted"
                      style={track.artwork ? { backgroundImage: `url(${track.artwork})` } : {}}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to="/tracks/$id"
                            params={{ id: track.id }}
                            className="font-semibold text-base hover:text-primary transition-colors truncate block"
                          >
                            {track.title}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                            {track.label}
                            <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                            <span className="text-muted-foreground/60">·</span>
                            {track.genre}
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span className="font-semibold text-base">€{track.price}</span>
                          <button
                            onClick={() => cart.remove(track.id)}
                            className="w-8 h-8 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* What's included */}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {[
                          { icon: <FileAudio className="w-3.5 h-3.5" />, label: "WAV Master + Unmastered" },
                          { icon: <FileArchive className="w-3.5 h-3.5" />, label: "Stems ZIP" },
                          { icon: <Music className="w-3.5 h-3.5" />, label: "MIDI Files" },
                          { icon: <FileText className="w-3.5 h-3.5" />, label: "Legal Transfer Docs" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="text-primary/70">{item.icon}</span>
                            {item.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rights badge */}
                  <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs text-foreground/80">
                      <strong>100% Exclusive Rights Transfer</strong> — One sale only. Permanently removed from marketplace after purchase.
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Lock className="w-5 h-5 text-green-500" />, label: "256-Bit SSL", sub: "Bank-grade security" },
                { icon: <Shield className="w-5 h-5 text-blue-500" />, label: "Exclusive Rights", sub: "Legally binding NDA" },
                { icon: <Zap className="w-5 h-5 text-yellow-500" />, label: "Instant Delivery", sub: "Download immediately" },
              ].map((b) => (
                <div key={b.label} className="p-3 rounded-xl bg-card border border-border text-center">
                  <div className="grid place-items-center mb-1">{b.icon}</div>
                  <div className="text-xs font-semibold">{b.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{b.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Payment Form ── */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

              {/* Pricing breakdown */}
              <div className="p-6 border-b border-border">
                <h2 className="font-semibold text-base mb-4">Price Details</h2>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({cart.items.length} track{cart.items.length > 1 ? "s" : ""})</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee (3%)</span>
                    <span>€{serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2.5 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-primary">€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="p-6 border-b border-border space-y-4">
                <h2 className="font-semibold text-base">Contact Information</h2>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1.5">Email</label>
                  <div className="h-11 px-4 rounded-xl border border-border bg-muted/50 flex items-center text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-11 px-2 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 text-sm"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code + c.country} value={c.code}>{c.flag} {c.code}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPhone(val);
                        setPhoneError(validatePhone(val));
                      }}
                      className={`flex-1 h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm transition ${
                        phoneError ? "border-destructive" : "border-border focus:border-primary/40"
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {phoneError && phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {phoneError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* T&C */}
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-primary shrink-0"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition">
                    I accept the{" "}
                    <Link to="/terms" className="text-primary hover:underline font-medium">Terms &amp; Conditions</Link>
                    {" "}and agree to the exclusive rights transfer for all tracks in my cart.
                  </span>
                </label>
              </div>

              {/* Payment */}
              <div className="p-6 space-y-4">
                <h2 className="font-semibold text-base">Payment</h2>

                {!canPay ? (
                  <div className="space-y-2">
                    {!phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Enter your phone number to continue
                      </p>
                    )}
                    {phone && phoneError && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Fix the phone number error above
                      </p>
                    )}
                    {!termsAccepted && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Accept the Terms &amp; Conditions to continue
                      </p>
                    )}
                    <div className="h-12 rounded-xl bg-muted animate-pulse opacity-50" />
                  </div>
                ) : paypalLoading ? (
                  <div className="space-y-2">
                    <div className="h-12 rounded-xl bg-muted animate-pulse" />
                    <div className="h-12 rounded-xl bg-muted animate-pulse" />
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-xs text-center text-muted-foreground">
                      Pay securely with PayPal or Debit/Credit Card
                    </p>
                    <PayPalButtons
                      style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay", height: 50 }}
                      disabled={processing}
                      forceReRender={[total, phone, countryCode]}
                      fundingSource={undefined}
                      createOrder={createPayPalOrder}
                      onApprove={onApprove}
                      onError={(err) => {
                        console.error("[PayPal]", err);
                        toast.error("Payment error. Please try again.");
                      }}
                      onCancel={() => {
                        toast.info("Payment cancelled.");
                        setProcessing(false);
                      }}
                    />
                  </motion.div>
                )}

                {/* Security note */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/70 pt-1">
                  <Lock className="w-3 h-3" />
                  <span>Payments secured by PayPal · 256-bit SSL encryption</span>
                </div>
              </div>
            </div>

            {/* A&R note */}
            <div className="mt-4 p-4 rounded-xl bg-accent/50 border border-border flex items-start gap-3">
              <ShoppingBag className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/70 leading-relaxed">
                After payment, tracks are <strong>permanently removed</strong> from our marketplace.
                You'll receive an email confirmation with download links instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
