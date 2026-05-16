import { useState, useRef, useCallback, useEffect } from "react";
import { Search, X, Music2, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type TrackResult = { id: string; title: string; genre: string; price: number; artwork_url: string | null; bpm: number; musical_key: string };
type ProfileResult = { id: string; display_name: string | null; avatar_url: string | null; role: string };

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function SmartSearch() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<TrackResult[]>([]);
  const [profiles, setProfiles] = useState<ProfileResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setTracks([]); setProfiles([]); setLoading(false); return; }
      setLoading(true);
      const [t, p] = await Promise.all([
        supabase
          .from("tracks")
          .select("id, title, genre, price, artwork_url, bpm, musical_key")
          .in("status", ["approved", "sold"])
          .or(`title.ilike.%${q}%,genre.ilike.%${q}%`)
          .limit(5),
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url, role")
          .ilike("display_name", `%${q}%`)
          .in("role", ["seller", "admin"])
          .limit(3),
      ]);
      setTracks(t.data ?? []);
      setProfiles(p.data ?? []);
      setLoading(false);
    }, 280),
    [],
  );

  useEffect(() => { doSearch(query); }, [query, doSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasResults = tracks.length > 0 || profiles.length > 0;
  const clear = () => { setQuery(""); setTracks([]); setProfiles([]); inputRef.current?.focus(); };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search tracks, genres, producers..."
          className="w-full h-11 pl-11 pr-10 rounded-full bg-white/80 border border-border focus:bg-white focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm placeholder:text-muted-foreground transition-all"
        />
        {query && (
          <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 grid place-items-center rounded-full hover:bg-muted">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 bg-background border border-border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden z-50"
          >
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">Searching...</div>
            ) : !hasResults ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No results for "{query}"</div>
            ) : (
              <div className="py-2">
                {tracks.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Tracks</div>
                    {tracks.map((t) => (
                      <Link
                        key={t.id}
                        to="/tracks/$id"
                        params={{ id: t.id }}
                        onClick={() => { setOpen(false); clear(); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
                      >
                        <div
                          className="w-9 h-9 rounded-lg shrink-0 bg-muted"
                          style={t.artwork_url ? { backgroundImage: `url(${t.artwork_url})`, backgroundSize: "cover" } : {}}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{t.title}</div>
                          <div className="text-xs text-muted-foreground">{t.genre} · {t.bpm} BPM · {t.musical_key}</div>
                        </div>
                        <div className="text-sm font-semibold shrink-0">${t.price}</div>
                      </Link>
                    ))}
                  </>
                )}
                {profiles.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground border-t border-border mt-1">Producers</div>
                    {profiles.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors cursor-pointer">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-white text-xs font-semibold shrink-0">
                          {p.avatar_url
                            ? <img src={p.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                            : (p.display_name ?? "?").charAt(0).toUpperCase()
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{p.display_name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{p.role}</div>
                        </div>
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </>
                )}
                <div className="border-t border-border mt-1 px-4 py-2.5">
                  <Link
                    to="/tracks"
                    onClick={() => { setOpen(false); clear(); }}
                    className="text-xs text-primary font-medium flex items-center gap-1.5"
                  >
                    <Music2 className="w-3.5 h-3.5" /> View all results for "{query}"
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
