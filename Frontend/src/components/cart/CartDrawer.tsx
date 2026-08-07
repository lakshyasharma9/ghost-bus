import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Lock, Shield, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/store";

const COUNTRY_CODES = [
  { code: "+1", country: "US", flag: "🇺🇸" }, { code: "+44", country: "GB", flag: "🇬🇧" },
  { code: "+49", country: "DE", flag: "🇩🇪" }, { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+39", country: "IT", flag: "🇮🇹" }, { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+31", country: "NL", flag: "🇳🇱" }, { code: "+46", country: "SE", flag: "🇸🇪" },
  { code: "+47", country: "NO", flag: "🇳🇴" }, { code: "+45", country: "DK", flag: "🇩🇰" },
  { code: "+48", country: "PL", flag: "🇵🇱" }, { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+64", country: "NZ", flag: "🇳🇿" }, { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+52", country: "MX", flag: "🇲🇽" }, { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+81", country: "JP", flag: "🇯🇵" }, { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+65", country: "SG", flag: "🇸🇬" }, { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+7", country: "RU", flag: "🇷🇺" }, { code: "+380", country: "UA", flag: "🇺🇦" },
  { code: "+90", country: "TR", flag: "🇹🇷" }, { code: "+20", country: "EG", flag: "🇪🇬" },
  { code: "+27", country: "ZA", flag: "🇿🇦" },
];

export function CartDrawer() {
  const cart = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [processing, setProcessing] = useState(false);

  const subtotal = cart.items.reduce((s, i) => s + i.track.price, 0);
  const serviceFee = Math.round(subtotal * 0.03);
  const total = subtotal + serviceFee;

  const validatePhone = (val: string) => {
    if (!val) return "Phone number is required";
    if (!/^\d+$/.test(val)) return "Numbers only — no spaces or dashes";
    if (val.length < 7) return "Phone number is too short";
    if (val.length > 15) return "Phone number is too long";
    return "";
  };

  const handleCheckout = () => {
    const err = validatePhone(phone);
    if (err) { setPhoneError(err); return; }
    if (!termsAccepted) { return; }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      alert("Checkout coming soon! Stripe integration in progress.");
    }, 1000);
  };

  return (
    <AnimatePresence>
      {cart.open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { cart.setOpen(false); setShowCheckout(false); }}
            className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-[71] w-full max-w-[460px] bg-background flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span className="font-semibold">Your Cart</span>
                <span className="text-muted-foreground text-sm">· {cart.items.length}</span>
              </div>
              <button onClick={() => { cart.setOpen(false); setShowCheckout(false); }} className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart.items.length === 0 ? (
                <div className="h-full grid place-items-center text-center">
                  <div>
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-muted grid place-items-center mb-4">
                      <ShoppingBag className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="font-semibold">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground mt-1">Browse exclusive ghost tracks to get started.</p>
                  </div>
                </div>
              ) : (
                <>
                  <ul className="space-y-3 mb-4">
                    {cart.items.map(({ track }) => (
                      <li key={track.id} className="flex items-start gap-3 p-3 rounded-2xl bg-muted/50 border border-border">
                        <div
                          className="w-14 h-14 rounded-xl shrink-0 bg-cover bg-center bg-muted"
                          style={track.artwork ? { backgroundImage: `url(${track.artwork})` } : {}}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate text-sm">{track.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{track.label} · {track.genre}</div>
                          <div className="mt-1 text-sm font-semibold">€{track.price}</div>
                          {/* Included files summary */}
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {["WAV", "Stems", "MIDI", "Legal"].map((f) => (
                              <span key={f} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">{f}</span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => cart.remove(track.id)} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-background text-muted-foreground hover:text-destructive transition mt-0.5">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Checkout gate — only show when user clicks Checkout */}
                  {showCheckout && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 mb-4"
                    >
                      {/* Phone number field */}
                      <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1.5">
                          Phone Number * <span className="text-muted-foreground font-normal">(required for purchase)</span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="h-11 px-2 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 text-sm"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code + c.country} value={c.code}>
                                {c.flag} {c.code}
                              </option>
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
                              phoneError ? "border-destructive focus:border-destructive" : "border-border focus:border-primary/40"
                            }`}
                          />
                        </div>
                        <AnimatePresence>
                          {phoneError && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive"
                            >
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              {phoneError}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* T&C acceptance */}
                      <div className="flex items-start gap-2.5">
                        <input
                          id="tc-accept"
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-primary shrink-0"
                        />
                        <label htmlFor="tc-accept" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                          I accept the{" "}
                          <Link to="/terms" onClick={() => cart.setOpen(false)} className="text-primary hover:underline font-medium">
                            Terms &amp; Conditions
                          </Link>{" "}
                          and agree to the exclusive rights transfer for all tracks in my cart.
                        </label>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Footer with totals and checkout */}
            {cart.items.length > 0 && (
              <div className="border-t border-border p-6 space-y-3">
                {/* Trust bar */}
                <div className="flex items-center justify-center gap-4 py-2 px-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-success" /> 256-Bit SSL</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-success" /> 100% Exclusive Rights</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-success" /> Instant Delivery</span>
                </div>

                <Row label="Subtotal" value={`€${subtotal}`} />
                <Row label="Service fee (3%)" value={`€${serviceFee}`} />
                <Row label="Total" value={`€${total}`} bold />

                {!showCheckout ? (
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-[--color-primary-hover] transition shadow-[0_10px_30px_rgba(10,132,255,0.28)]"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={!termsAccepted || !!validatePhone(phone) || processing}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-[--color-primary-hover] transition shadow-[0_10px_30px_rgba(10,132,255,0.28)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? "Processing..." : `Pay €${total}`}
                  </button>
                )}

                <div className="pt-1 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span>Full copyright transfer with legally binding documentation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span>Tracks permanently removed from marketplace on purchase</span>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? "font-semibold text-base" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className={bold ? "text-foreground" : ""}>{value}</span>
    </div>
  );
}
