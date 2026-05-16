import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Lock, Loader2, Shield, Zap } from "lucide-react";
import { useCart } from "@/store";
import { useCreateCheckout } from "@/hooks/use-api";

export function CartDrawer() {
  const cart = useCart();
  const subtotal = cart.items.reduce((s, i) => s + i.track.price, 0);
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;

  return (
    <AnimatePresence>
      {cart.open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => cart.setOpen(false)}
            className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-[71] w-full max-w-[440px] bg-background flex flex-col shadow-2xl"
          >
            <div className="h-16 px-6 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4.5 h-4.5" />
                <span className="font-semibold">Your Cart</span>
                <span className="text-muted-foreground text-sm">· {cart.items.length}</span>
              </div>
              <button onClick={() => cart.setOpen(false)} className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

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
                <ul className="space-y-3">
                  {cart.items.map(({ track }) => (
                    <li key={track.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border">
                      <div className="w-14 h-14 rounded-xl shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${track.artwork})` }} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{track.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{track.label} · {track.genre}</div>
                        <div className="mt-1 text-sm font-semibold">₹{track.price}</div>
                      </div>
                      <button onClick={() => cart.remove(track.id)} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-background text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart.items.length > 0 && (
              <div className="border-t border-border p-6 space-y-3">
                <Row label="Subtotal" value={`₹${subtotal}`} />
                <Row label="Tax" value={`₹${tax}`} />
                <Row label="Total" value={`₹${total}`} bold />
                <CheckoutButton trackIds={cart.items.map((i) => i.track.id)} />
                
                {/* Checkout Features */}
                <div className="pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3.5 h-3.5 text-success" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3.5 h-3.5 text-success" />
                    <span>100% Exclusive Rights Transfer</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="w-3.5 h-3.5 text-success" />
                    <span>Instant Delivery</span>
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

function CheckoutButton({ trackIds }: { trackIds: string[] }) {
  const checkout = useCreateCheckout();
  return (
    <button
      onClick={() => checkout.mutate(trackIds)}
      disabled={checkout.isPending}
      className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-[--color-primary-hover] transition shadow-[0_10px_30px_rgba(10,132,255,0.28)] disabled:opacity-60 inline-flex items-center justify-center gap-2"
    >
      {checkout.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Checkout"}
    </button>
  );
}
