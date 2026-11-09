import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Lock, Shield, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/store";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEffect, useCallback } from "react";

export function CartDrawer() {
  const cart = useCart();
  const { user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();

  // If auth is done loading and user is null (logged out), close the cart drawer
  useEffect(() => {
    if (!authLoading && !user && cart.open) {
      cart.setOpen(false);
    }
  }, [authLoading, user, cart.open]);

  // Lock body scroll when drawer is open — also prevents background page scroll
  useEffect(() => {
    if (cart.open) {
      const scrollY = window.scrollY;
      document.body.dataset.scrollY = String(scrollY);
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflowY = "scroll";
    } else {
      const scrollY = document.body.dataset.scrollY || "0";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
      delete document.body.dataset.scrollY;
      window.scrollTo(0, parseInt(scrollY) * 1);
    }
    return () => {
      const scrollY = document.body.dataset.scrollY || "0";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
      delete document.body.dataset.scrollY;
      window.scrollTo(0, parseInt(scrollY) * 1);
    };
  }, [cart.open]);

  const closeCart = useCallback(() => {
    cart.setOpen(false);
  }, [cart]);

  const subtotal   = cart.items.reduce((s, i) => s + i.track.price, 0);
  const serviceFee = Math.round(subtotal * 0.03 * 100) / 100;
  const total      = subtotal + serviceFee;

  const handleProceedClick = () => {
    // Close cart drawer first, then navigate after body scroll is restored
    closeCart();
    setTimeout(() => {
      if (!user) {
        navigate({ to: "/login" as any, search: { redirect: "/checkout" } as any });
      } else {
        navigate({ to: "/checkout" as any });
      }
    }, 50);
  };

  return (
    <AnimatePresence>
      {cart.open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-[71] w-full max-w-[440px] bg-background flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span className="font-semibold">Your Cart</span>
                {cart.items.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                    {cart.items.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart items */}
            <div
              className="flex-1 overflow-y-auto px-6 py-5"
              style={{ overscrollBehavior: "contain" }}
              onWheel={(e) => e.stopPropagation()}
            >
              {cart.items.length === 0 ? (
                <div className="h-full grid place-items-center text-center">
                  <div>
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-muted grid place-items-center mb-4">
                      <ShoppingBag className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="font-semibold">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground mt-1">Browse exclusive ghost tracks to get started.</p>
                    <Link
                      to="/tracks"
                      onClick={() => cart.setOpen(false)}
                      className="mt-5 inline-flex h-10 px-5 items-center rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[--color-primary-hover] transition"
                    >
                      Browse Tracks
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.items.map(({ track }) => (
                    <motion.div
                      key={track.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border hover:border-border/80 transition"
                    >
                      {/* Artwork */}
                      <Link
                        to="/tracks/$id"
                        params={{ id: track.id }}
                        onClick={() => cart.setOpen(false)}
                        className="shrink-0"
                      >
                        <div
                          className="w-14 h-14 rounded-xl bg-cover bg-center bg-muted hover:opacity-90 transition"
                          style={track.artwork ? { backgroundImage: `url(${track.artwork})` } : {}}
                        />
                      </Link>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/tracks/$id"
                          params={{ id: track.id }}
                          onClick={() => cart.setOpen(false)}
                          className="font-medium text-sm truncate block hover:text-primary transition-colors"
                        >
                          {track.title}
                        </Link>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {track.label} · {track.genre}
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {["WAV", "Stems", "MIDI", "Legal"].map((f) => (
                              <span key={f} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">{f}</span>
                            ))}
                          </div>
                          <span className="font-semibold text-sm shrink-0 ml-2">€{track.price}</span>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => cart.remove(track.id)}
                        className="w-8 h-8 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0"
                        aria-label="Remove from cart"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4 shrink-0">
                {/* Trust bar */}
                <div className="flex items-center justify-center gap-3 py-2 px-3 rounded-xl bg-muted/50 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-green-500" /> SSL Secure</span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-blue-500" /> Exclusive Rights</span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> Instant Delivery</span>
                </div>

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Service fee (3%)</span>
                    <span>€{serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-1 border-t border-border">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleProceedClick}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-[--color-primary-hover] transition shadow-[0_8px_24px_rgba(10,132,255,0.28)]"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Assurances */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span>Full copyright transfer · Legally binding documentation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
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
