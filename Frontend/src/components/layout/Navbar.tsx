import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Heart, ShoppingBag, Menu, X, LogOut, User, Home, Mail, Users, ChevronDown, Search } from "lucide-react";
import { useCart, useAudio } from "@/store";
import { useAuthContext } from "@/contexts/AuthContext";
import { GENRES, GENRE_SLUGS } from "@/lib/mock-data";

const GENRE_COLS = [
  GENRES.slice(0, 7),
  GENRES.slice(7, 14),
  GENRES.slice(14),
];

const SERVICES_MENU = [
  { label: "Custom Ghost Production", desc: "Full track from scratch" },
  { label: "Mixing & Mastering", desc: "Professional polish" },
  { label: "Vocal Topline", desc: "Lyrics & melody writing" },
  { label: "Stems Cleanup", desc: "Edit & organize stems" },
  { label: "DJ Edit / Extended Mix", desc: "Club-ready versions" },
  { label: "Sound Design Pack", desc: "Custom presets & samples" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const cart = useCart();
  const playing = useAudio((s) => s.current);
  const { user, signOut, sellerModeEnabled } = useAuthContext();
  const initial = (user?.fullName || user?.email || "?").charAt(0).toUpperCase();
  const genreRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) setGenreOpen(false);
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0)",
          borderBottomColor: scrolled ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0)",
          height: scrolled ? 64 : 72,
        }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="fixed top-0 inset-x-0 z-50 border-b backdrop-blur-xl"
        style={{ WebkitBackdropFilter: scrolled ? "saturate(180%) blur(20px)" : "none" }}
      >
        <div className="container-app h-full flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#060226] to-[#1a0a5e] grid place-items-center text-white font-bold text-sm shadow-[0_4px_14px_rgba(6,2,38,0.45)]">
              G
            </div>
            <span className="font-semibold tracking-tight text-[17px]">GhostBus</span>
          </Link>

          {/* Smart Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-auto">
            {/* <SmartSearch /> */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                placeholder="Search tracks, genres, producers..."
                className="w-full h-11 pl-11 pr-4 rounded-full bg-white/80 border border-border focus:bg-white focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm placeholder:text-muted-foreground transition-all"
                disabled
              />
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Genres Dropdown */}
            <div 
              ref={genreRef} 
              className="relative"
              onMouseEnter={() => { setGenreOpen(true); setServicesOpen(false); }}
              onMouseLeave={() => setGenreOpen(false)}
            >
              <button
                className="px-3 py-2 text-sm text-foreground/80 hover:text-foreground inline-flex items-center gap-1"
              >
                Genres <ChevronDown className={`w-3.5 h-3.5 transition-transform ${genreOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {genreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-[480px] bg-background border border-border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-5 z-50"
                  >
                    <div className="label-eyebrow mb-3">Browse by Genre</div>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                      {GENRE_COLS.map((col, ci) => (
                        <div key={ci} className="space-y-1">
                          {col.map((g) => (
                            <Link
                              key={g}
                              to={`/genres/${GENRE_SLUGS[g]}`}
                              onClick={() => setGenreOpen(false)}
                              className="block px-3 py-2 rounded-xl text-sm hover:bg-muted hover:text-primary transition-colors"
                            >
                              {g}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <Link to="/tracks" onClick={() => setGenreOpen(false)} className="text-xs text-primary font-medium">
                        View all tracks →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/sell"
              className="px-3 py-2 text-sm text-foreground/80 hover:text-foreground relative group"
              activeProps={{ className: "text-primary font-medium" }}
            >
              Start Selling
              <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <button
              aria-label="Wishlist"
              className="w-10 h-10 rounded-full grid place-items-center hover:bg-muted transition-colors"
            >
              <Heart className="w-4.5 h-4.5" />
            </button>
            {/* <NotificationBell /> */}
            <button
              onClick={() => cart.setOpen(true)}
              aria-label="Cart"
              className="relative w-10 h-10 rounded-full grid place-items-center hover:bg-muted transition-colors"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cart.items.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold grid place-items-center">
                  {cart.items.length}
                </span>
              )}
            </button>

            {user ? (
              <div ref={profileRef} className="relative hidden sm:block">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="inline-flex h-9 items-center gap-2 pl-1 pr-3 rounded-full border border-border hover:bg-muted transition"
                >
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#060226] to-[#1a0a5e] grid place-items-center text-white text-xs font-semibold">{initial}</span>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user.fullName ?? user.email?.split("@")[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-background border border-border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <div className="text-sm font-semibold truncate">{user.fullName ?? "User"}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                        {sellerModeEnabled && (
                          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            Seller Mode
                          </div>
                        )}
                      </div>
                      <div className="py-1.5">
                        {sellerModeEnabled ? (
                          // Seller Dashboard Options
                          <>
                            <DropItem icon={<Home className="w-4 h-4" />} label="Seller Dashboard" to="/dashboard" onClick={() => setProfileOpen(false)} />
                            <DropItem icon={<ShoppingBag className="w-4 h-4" />} label="My Tracks" to="/dashboard/tracks" onClick={() => setProfileOpen(false)} />
                            <DropItem icon={<User className="w-4 h-4" />} label="Upload Track" to="/dashboard/upload" onClick={() => setProfileOpen(false)} />
                            <DropItem icon={<Mail className="w-4 h-4" />} label="Messages" to="/dashboard/messages" onClick={() => setProfileOpen(false)} />
                            <DropItem icon={<Users className="w-4 h-4" />} label="Earnings" to="/dashboard/earnings" onClick={() => setProfileOpen(false)} />
                            <DropItem icon={<User className="w-4 h-4" />} label="Analytics" to="/dashboard/analytics" onClick={() => setProfileOpen(false)} />
                            <DropItem icon={<Home className="w-4 h-4" />} label="Switch to Buyer" to="/account" onClick={() => setProfileOpen(false)} />
                          </>
                        ) : (
                          // Buyer Dashboard Options
                          <>
                            <DropItem icon={<Home className="w-4 h-4" />} label="Account Overview" to="/account" onClick={() => setProfileOpen(false)} />
                            <DropItem icon={<User className="w-4 h-4" />} label="Start Selling" to="/apply-seller" onClick={() => setProfileOpen(false)} />
                            <DropItem icon={<ShoppingBag className="w-4 h-4" />} label="My Orders" to="/account/orders" onClick={() => setProfileOpen(false)} />
                            <DropItem icon={<Heart className="w-4 h-4" />} label="Favorites" to="/account/favorites" onClick={() => setProfileOpen(false)} />
                            <DropItem icon={<Users className="w-4 h-4" />} label="Following" to="/account/following" onClick={() => setProfileOpen(false)} />
                            <DropItem icon={<User className="w-4 h-4" />} label="Edit Profile" to="/account/profile" onClick={() => setProfileOpen(false)} />
                            <DropItem icon={<Mail className="w-4 h-4" />} label="Mailing" to="/account/mailing" onClick={() => setProfileOpen(false)} />
                          </>
                        )}
                      </div>
                      <div className="border-t border-border py-1.5">
                        <button
                          onClick={() => { signOut(); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex h-10 px-4 items-center text-sm font-medium text-foreground/80 hover:text-foreground">
                  Log in
                </Link>
                <Link to="/login" className="hidden sm:inline-flex h-10 px-4 items-center rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition">
                  Sign up
                </Link>
              </>
            )}
            <button onClick={() => setMobile(true)} aria-label="Menu" className="lg:hidden w-10 h-10 rounded-full grid place-items-center hover:bg-muted">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white overflow-y-auto"
          >
            <div className="container-app h-16 flex items-center justify-between border-b">
              <span className="font-semibold">Menu</span>
              <button onClick={() => setMobile(false)} className="w-10 h-10 rounded-full grid place-items-center hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="container-app py-4">
              {/* <SmartSearch /> */}
            </div>
            <nav className="container-app py-4 flex flex-col gap-1">
              <Link to="/tracks" onClick={() => setMobile(false)} className="py-3.5 text-xl font-semibold tracking-tight border-b border-border">Genres</Link>
              <Link to="/services" onClick={() => setMobile(false)} className="py-3.5 text-xl font-semibold tracking-tight border-b border-border">Services</Link>
              <Link to="/sell" onClick={() => setMobile(false)} className="py-3.5 text-xl font-semibold tracking-tight border-b border-border">Start Selling</Link>
              <Link to="/how-we-work" onClick={() => setMobile(false)} className="py-3.5 text-xl font-semibold tracking-tight border-b border-border">How We Work</Link>
              {user ? (
                <>
                  {sellerModeEnabled ? (
                    <>
                      <Link to="/dashboard" onClick={() => setMobile(false)} className="py-3.5 text-xl font-semibold tracking-tight border-b border-border">Seller Dashboard</Link>
                      <Link to="/dashboard/tracks" onClick={() => setMobile(false)} className="py-3.5 text-xl font-semibold tracking-tight border-b border-border">My Tracks</Link>
                      <Link to="/dashboard/upload" onClick={() => setMobile(false)} className="py-3.5 text-xl font-semibold tracking-tight border-b border-border">Upload Track</Link>
                      <Link to="/account" onClick={() => setMobile(false)} className="py-3.5 text-xl font-semibold tracking-tight border-b border-border">Switch to Buyer</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/account" onClick={() => setMobile(false)} className="py-3.5 text-xl font-semibold tracking-tight border-b border-border">Account</Link>
                      <Link to="/account/orders" onClick={() => setMobile(false)} className="py-3.5 text-xl font-semibold tracking-tight border-b border-border">My Orders</Link>
                    </>
                  )}
                  <button onClick={() => { signOut(); setMobile(false); }} className="py-3.5 text-xl font-semibold tracking-tight text-destructive text-left">Sign out</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobile(false)} className="py-3.5 text-xl font-semibold tracking-tight text-primary">Log in / Sign up</Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: 72 }} />
    </>
  );
}

function DropItem({ icon, label, to, onClick }: { icon: React.ReactNode; label: string; to: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </Link>
  );
}
