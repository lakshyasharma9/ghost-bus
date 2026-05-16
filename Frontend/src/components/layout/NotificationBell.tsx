import { useRef, useState, useEffect } from "react";
import { Bell, ShoppingBag, MessageCircle, ShieldCheck, DollarSign, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks/use-api";
import type { Tables } from "@/integrations/supabase/types";

const ICONS: Record<string, React.ReactNode> = {
  sale: <ShoppingBag className="w-4 h-4 text-emerald-500" />,
  message: <MessageCircle className="w-4 h-4 text-primary" />,
  review_approved: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
  review_rejected: <ShieldCheck className="w-4 h-4 text-destructive" />,
  withdrawal: <DollarSign className="w-4 h-4 text-primary" />,
  system: <Info className="w-4 h-4 text-muted-foreground" />,
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: rawNotifications } = useNotifications();
  const notifications = (rawNotifications ?? []) as Tables<"notifications">[];
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative w-10 h-10 rounded-full grid place-items-center hover:bg-muted transition-colors"
      >
        <Bell className="w-4.5 h-4.5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-[360px] bg-background border border-border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold text-sm">Notifications</span>
              {unread > 0 && (
                <button
                  onClick={() => markAll.mutate()}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { if (!n.read) markOne.mutate(n.id); }}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors text-left border-b border-border last:border-0 ${!n.read ? "bg-accent/40" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted grid place-items-center shrink-0 mt-0.5">
                      {ICONS[n.type] ?? ICONS.system}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-tight">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{timeAgo(n.created_at)}</div>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
