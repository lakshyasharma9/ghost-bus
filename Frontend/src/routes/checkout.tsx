import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Trash2, Lock, Shield, Zap,
  CheckCircle2, AlertCircle, ArrowLeft, FileAudio,
  FileArchive, FileText, Music, BadgeCheck, Globe,
  ChevronDown, Loader2,
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

// ─── Country list ─────────────────────────────────────────────────────────────
// India separated at top for detection — rest alphabetical

const COUNTRIES = [
  { code: "IN", name: "India 🇮🇳",          dialCode: "+91",  gateway: "cashfree" },
  { code: "US", name: "United States 🇺🇸",   dialCode: "+1",   gateway: "paypal"   },
  { code: "GB", name: "United Kingdom 🇬🇧",  dialCode: "+44",  gateway: "paypal"   },
  { code: "DE", name: "Germany 🇩🇪",         dialCode: "+49",  gateway: "paypal"   },
  { code: "FR", name: "France 🇫🇷",          dialCode: "+33",  gateway: "paypal"   },
  { code: "IT", name: "Italy 🇮🇹",           dialCode: "+39",  gateway: "paypal"   },
  { code: "ES", name: "Spain 🇪🇸",           dialCode: "+34",  gateway: "paypal"   },
  { code: "NL", name: "Netherlands 🇳🇱",     dialCode: "+31",  gateway: "paypal"   },
  { code: "SE", name: "Sweden 🇸🇪",          dialCode: "+46",  gateway: "paypal"   },
  { code: "NO", name: "Norway 🇳🇴",          dialCode: "+47",  gateway: "paypal"   },
  { code: "DK", name: "Denmark 🇩🇰",         dialCode: "+45",  gateway: "paypal"   },
  { code: "PL", name: "Poland 🇵🇱",          dialCode: "+48",  gateway: "paypal"   },
  { code: "AU", name: "Australia 🇦🇺",       dialCode: "+61",  gateway: "paypal"   },
  { code: "NZ", name: "New Zealand 🇳🇿",     dialCode: "+64",  gateway: "paypal"   },
  { code: "BR", name: "Brazil 🇧🇷",          dialCode: "+55",  gateway: "paypal"   },
  { code: "MX", name: "Mexico 🇲🇽",          dialCode: "+52",  gateway: "paypal"   },
  { code: "JP", name: "Japan 🇯🇵",           dialCode: "+81",  gateway: "paypal"   },
  { code: "KR", name: "South Korea 🇰🇷",     dialCode: "+82",  gateway: "paypal"   },
  { code: "SG", name: "Singapore 🇸🇬",       dialCode: "+65",  gateway: "paypal"   },
  { code: "AE", name: "UAE 🇦🇪",             dialCode: "+971", gateway: "paypal"   },
  { code: "TR", name: "Turkey 🇹🇷",          dialCode: "+90",  gateway: "paypal"   },
  { code: "ZA", name: "South Africa 🇿🇦",    dialCode: "+27",  gateway: "paypal"   },
  { code: "EG", name: "Egypt 🇪🇬",           dialCode: "+20",  gateway: "paypal"   },
  { code: "RU", name: "Russia 🇷🇺",          dialCode: "+7",   gateway: "paypal"   },
  { code: "UA", name: "Ukraine 🇺🇦",         dialCode: "+380", gateway: "paypal"   },
];

// ─── Cashfree JS SDK loader ───────────────────────────────────────────────────

declare global {
  interface Window {
    Cashfree?: (config: { mode: string }) => {
      checkout: (options: Record<string, unknown>) => Promise<{ error?: unknown; redirect?: boolean; paymentDetails?: unknown }>;
    };
  }
}

function loadCashfreeSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) { resolve(); return; }
    const existing = document.getElementById("cashfree-sdk");
    if (existing) { resolve(); return; }
    const script = document.createElement("script");
    script.id  = "cashfree-sdk";
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
    document.head.appendChild(script);
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

function CheckoutPage() {
  const cart     = useCart();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [{ isPending: paypalLoading }] = usePayPalScriptReducer();

  // Form state
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // India default
  const [phone,           setPhone]           = useState("");
  const [phoneError,      setPhoneError]      = useState("");
  const [termsAccepted,   setTermsAccepted]   = useState(false);
  const [processing,      setProcessing]      = useState(false);

  // India-specific: live INR price
  const [inrRate,         setInrRate]         = useState<number | null>(null);
  const [inrLoading,      setInrLoading]      = useState(false);

  const isIndia   = selectedCountry.code === "IN";
  const gateway   = selectedCountry.gateway; // 'cashfree' | 'paypal'

  // Redirect guards
  useEffect(() => {
    if (!user) navigate({ to: "/login" as any, search: { redirect: "/checkout" } as any });
  }, [user, navigate]);

  useEffect(() => {
    if (cart.items.length === 0 && !processing) navigate({ to: "/tracks" as any });
  }, [cart.items.length, processing, navigate]);

  // Fetch live INR rate when India is selected
  useEffect(() => {
    if (!isIndia) { setInrRate(null); return; }
    setInrLoading(true);
    fetch("https://api.exchangerate-api.com/v4/latest/EUR")
      .then((r) => r.json())
      .then((d) => setInrRate(d.rates?.INR ?? 90))
      .catch(() => setInrRate(90))
      .finally(() => setInrLoading(false));
  }, [isIndia]);

  // Pricing
  const subtotalEur  = cart.items.reduce((s, i) => s + i.track.price, 0);
  const serviceFeeEur = Math.round(subtotalEur * 0.03 * 100) / 100;
  const totalEur     = subtotalEur + serviceFeeEur;
  const totalInr     = inrRate ? Math.round(totalEur * inrRate * 100) / 100 : null;

  // Phone validation
  const validatePhone = useCallback((val: string, countryCode: string) => {
    if (!val) return "Phone number is required";
    if (!/^\d+$/.test(val)) return "Numbers only — no spaces or dashes";
    if (countryCode === "IN") {
      if (val.length !== 10) return "Indian mobile number must be exactly 10 digits";
    } else {
      if (val.length < 7)  return "Phone number is too short";
      if (val.length > 15) return "Phone number is too long";
    }
    return "";
  }, []);

  const canPay = termsAccepted && !validatePhone(phone, selectedCountry.code) && !processing;

  // ── PayPal flow ──────────────────────────────────────────────────────────────

  const createPayPalOrder = async () => {
    const { data } = await paymentAPI.createPayPalOrder({
      items:       cart.items.map((i) => ({ trackId: i.track.id })),
      buyerPhone:  phone,
      countryCode: selectedCountry.dialCode,
    });
    return data.data.paypalOrderId;
  };

  const onPayPalApprove = async (paypalData: { orderID: string }) => {
    setProcessing(true);
    try {
      await paymentAPI.capturePayPalOrder(paypalData.orderID);
      cart.clear();
      toast.success("Payment successful! Your files are ready to download.");
      navigate({ to: "/account/orders" as any });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Payment failed. Please try again.";
      toast.error(msg);
      setProcessing(false);
    }
  };

  // ── Cashfree flow ────────────────────────────────────────────────────────────

  const handleCashfreePayment = async () => {
    if (!canPay) return;
    setProcessing(true);

    try {
      // Load Cashfree JS SDK
      await loadCashfreeSDK();

      if (!window.Cashfree) {
        throw new Error("Cashfree SDK failed to load");
      }

      // Create order on backend
      const { data } = await paymentAPI.createCashfreeOrder({
        items:      cart.items.map((i) => ({ trackId: i.track.id })),
        buyerPhone: `+91${phone}`,
        buyerName:  user?.fullName || user?.username || undefined,
      });

      const { paymentSessionId, cashfreeOrderId } = data.data;

      // Initialize Cashfree checkout
      const cashfreeEnv = import.meta.env.VITE_CASHFREE_ENV || "sandbox";
      const cashfree = window.Cashfree({ mode: cashfreeEnv });

      const result = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_modal", // opens in modal overlay on same page
      });

      if (result.error) {
        toast.error("Payment failed. Please try again.");
        setProcessing(false);
        return;
      }

      // Verify payment with backend
      const verifyRes = await paymentAPI.verifyCashfreePayment(cashfreeOrderId);
      const status    = verifyRes.data.data?.status;

      if (status === "COMPLETED") {
        cart.clear();
        toast.success("Payment successful! Your files are ready to download.");
        navigate({ to: "/account/orders" as any });
      } else if (status === "PENDING") {
        toast.info("Payment is being processed. Check your orders in a few minutes.");
        navigate({ to: "/account/orders" as any });
      } else {
        toast.error("Payment was not completed. Please try again.");
        setProcessing(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Payment failed. Please try again.";
      toast.error(msg);
      setProcessing(false);
    }
  };

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
        <button
          onClick={() => navigate({ to: "/tracks" as any })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue shopping
        </button>

        <div className="grid lg:grid-cols-[1fr_440px] gap-8 items-start">

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
                  className="bg-card border border-border rounded-2xl p-4 md:p-5"
                >
                  <div className="flex gap-4">
                    <div
                      className="w-20 h-20 md:w-24 md:h-24 rounded-xl shrink-0 bg-cover bg-center bg-muted"
                      style={track.artwork ? { backgroundImage: `url(${track.artwork})` } : {}}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link to="/tracks/$id" params={{ id: track.id }}
                            className="font-semibold text-base hover:text-primary transition-colors truncate block">
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
                          <div className="text-right">
                            <span className="font-semibold text-base block">€{track.price}</span>
                            {isIndia && inrRate && (
                              <span className="text-xs text-muted-foreground">
                                ≈ ₹{Math.round(track.price * inrRate).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => cart.remove(track.id)}
                            className="w-8 h-8 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {[
                          { icon: <FileAudio className="w-3.5 h-3.5" />,   label: "WAV Master + Unmastered" },
                          { icon: <FileArchive className="w-3.5 h-3.5" />, label: "Stems ZIP" },
                          { icon: <Music className="w-3.5 h-3.5" />,       label: "MIDI Files" },
                          { icon: <FileText className="w-3.5 h-3.5" />,    label: "Legal Transfer Docs" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="text-primary/70">{item.icon}</span>
                            {item.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
                { icon: <Lock className="w-5 h-5 text-green-500" />,   label: "256-Bit SSL",      sub: "Bank-grade security" },
                { icon: <Shield className="w-5 h-5 text-blue-500" />,  label: "Exclusive Rights", sub: "Legally binding NDA" },
                { icon: <Zap className="w-5 h-5 text-yellow-500" />,   label: "Instant Delivery", sub: "Download immediately" },
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
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

              {/* ── Step 1: Select Country ── */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold text-base">Your Country</h2>
                </div>
                <div className="relative">
                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const c = COUNTRIES.find((x) => x.code === e.target.value)!;
                      setSelectedCountry(c);
                      setPhone("");
                      setPhoneError("");
                    }}
                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm appearance-none transition"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* India badge */}
                <AnimatePresence>
                  {isIndia && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-3 flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl"
                    >
                      <span className="text-lg">🇮🇳</span>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        <strong>India detected</strong> — Paying with UPI / Card via Cashfree. Price shown in ₹ INR.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Pricing breakdown ── */}
              <div className="p-6 border-b border-border">
                <h2 className="font-semibold text-base mb-4">Price Details</h2>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({cart.items.length} track{cart.items.length > 1 ? "s" : ""})</span>
                    <div className="text-right">
                      <span>€{subtotalEur.toFixed(2)}</span>
                      {isIndia && inrRate && (
                        <span className="block text-xs text-muted-foreground">
                          ≈ ₹{Math.round(subtotalEur * inrRate).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee (3%)</span>
                    <div className="text-right">
                      <span>€{serviceFeeEur.toFixed(2)}</span>
                      {isIndia && inrRate && (
                        <span className="block text-xs text-muted-foreground">
                          ≈ ₹{Math.round(serviceFeeEur * inrRate).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                  {isIndia && inrRate && (
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span>Exchange rate</span>
                      <span>1 EUR = ₹{inrRate.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2.5 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <div className="text-right">
                      {isIndia ? (
                        inrLoading ? (
                          <span className="flex items-center gap-1 text-primary">
                            <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                          </span>
                        ) : totalInr ? (
                          <div>
                            <span className="text-primary">₹{totalInr.toLocaleString("en-IN")}</span>
                            <span className="block text-xs text-muted-foreground font-normal">(€{totalEur.toFixed(2)})</span>
                          </div>
                        ) : (
                          <span className="text-primary">€{totalEur.toFixed(2)}</span>
                        )
                      ) : (
                        <span className="text-primary">€{totalEur.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Contact info ── */}
              <div className="p-6 border-b border-border space-y-4">
                <h2 className="font-semibold text-base">Contact Information</h2>
                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1.5">Email</label>
                  <div className="h-11 px-4 rounded-xl border border-border bg-muted/50 flex items-center text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <div className="flex gap-2">
                    {/* Country dial code — read-only, auto from country selection */}
                    <div className="h-11 px-3 rounded-xl border border-border bg-muted/50 flex items-center text-sm text-muted-foreground shrink-0 min-w-[64px]">
                      {selectedCountry.dialCode}
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder={isIndia ? "10-digit mobile number" : "Phone number"}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPhone(val);
                        if (val) setPhoneError(validatePhone(val, selectedCountry.code));
                        else setPhoneError("");
                      }}
                      className={`flex-1 h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm transition ${
                        phoneError ? "border-destructive" : "border-border focus:border-primary/40"
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {phoneError && phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
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

              {/* ── Payment section ── */}
              <div className="p-6 space-y-4">
                <h2 className="font-semibold text-base">
                  {isIndia ? "Pay with UPI / Card" : "Payment"}
                </h2>

                {/* Pre-conditions not met */}
                {!canPay ? (
                  <div className="space-y-2">
                    {!phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Enter your phone number to continue
                      </p>
                    )}
                    {phone && phoneError && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Fix the phone number error above
                      </p>
                    )}
                    {!termsAccepted && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Accept the Terms &amp; Conditions to continue
                      </p>
                    )}
                    <div className="h-12 rounded-xl bg-muted animate-pulse opacity-50" />
                  </div>
                ) : (

                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

                    {/* ── INDIA: Cashfree button ── */}
                    {isIndia && (
                      <>
                        <button
                          onClick={handleCashfreePayment}
                          disabled={processing || inrLoading || !totalInr}
                          className="w-full h-12 rounded-xl bg-[#FF6600] hover:bg-[#e55a00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition shadow-lg"
                        >
                          {processing ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                          ) : (
                            <>
                              <span className="text-base">🇮🇳</span>
                              Pay {totalInr ? `₹${totalInr.toLocaleString("en-IN")}` : "..."} — UPI / Card
                            </>
                          )}
                        </button>

                        {/* UPI logos */}
                        <div className="flex items-center justify-center gap-3 pt-1">
                          <span className="text-[10px] text-muted-foreground">Accepted:</span>
                          {["UPI", "PhonePe", "GPay", "Paytm", "Cards"].map((m) => (
                            <span key={m} className="text-[10px] px-2 py-0.5 bg-muted rounded-md text-muted-foreground font-medium">{m}</span>
                          ))}
                        </div>
                      </>
                    )}

                    {/* ── INTERNATIONAL: PayPal buttons ── */}
                    {!isIndia && (
                      <>
                        <p className="text-xs text-center text-muted-foreground">
                          Pay securely with PayPal or Debit/Credit Card
                        </p>
                        {paypalLoading ? (
                          <div className="space-y-2">
                            <div className="h-12 rounded-xl bg-muted animate-pulse" />
                            <div className="h-12 rounded-xl bg-muted animate-pulse" />
                          </div>
                        ) : (
                          <PayPalButtons
                            style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay", height: 50 }}
                            disabled={processing}
                            forceReRender={[totalEur, phone, selectedCountry.code]}
                            fundingSource={undefined}
                            createOrder={createPayPalOrder}
                            onApprove={onPayPalApprove}
                            onError={() => toast.error("Payment error. Please try again.")}
                            onCancel={() => { toast.info("Payment cancelled."); setProcessing(false); }}
                          />
                        )}
                      </>
                    )}
                  </motion.div>
                )}

                {/* Security note */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/70 pt-1">
                  <Lock className="w-3 h-3" />
                  <span>
                    {isIndia
                      ? "Payments secured by Cashfree · 256-bit SSL · PCI-DSS compliant"
                      : "Payments secured by PayPal · 256-bit SSL encryption"}
                  </span>
                </div>
              </div>
            </div>

            {/* A&R note */}
            <div className="p-4 rounded-xl bg-accent/50 border border-border flex items-start gap-3">
              <ShoppingBag className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/70 leading-relaxed">
                After payment, tracks are <strong>permanently removed</strong> from our marketplace.
                You'll receive download access immediately in your orders page.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
