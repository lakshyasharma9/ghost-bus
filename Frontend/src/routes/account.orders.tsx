import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, ShoppingBag, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { orderAPI } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/account/orders")({
  component: MyOrders,
});

interface OrderItem {
  id: string;
  price: number;
  track: {
    id: string;
    title: string;
    genre: string;
    coverUrl: string | null;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentMethod: string | null;
  paypalOrderId: string | null;
  paypalCaptureId: string | null;
  buyerEmail: string | null;
  createdAt: string;
  items: OrderItem[];
}

function MyOrders() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingItem, setDownloadingItem] = useState<string | null>(null);

  useEffect(() => {
    orderAPI.getAll()
      .then((res: any) => setOrders(res.data.data.orders ?? []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (orderId: string, itemId: string, trackTitle: string) => {
    setDownloadingItem(itemId);
    try {
      const res: any = await orderAPI.getDownloadUrl(orderId, itemId);
      const { downloads } = res.data.data;

      // Open mastered WAV first — most important file
      if (downloads.mastered) {
        window.open(downloads.mastered, "_blank");
      }

      // If there are more files, notify user
      const fileCount = Object.keys(downloads).length;
      if (fileCount > 1) {
        toast.success(`${trackTitle} — ${fileCount} files ready. Check your downloads.`);
      } else {
        toast.success(`Download started for "${trackTitle}"`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Download failed. Please try again.");
    } finally {
      setDownloadingItem(null);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "text-green-600 bg-green-50 border-green-200";
      case "PENDING":   return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "FAILED":    return "text-red-600 bg-red-50 border-red-200";
      case "REFUNDED":  return "text-blue-600 bg-blue-50 border-blue-200";
      default:          return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">My Orders</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted grid place-items-center mb-4">
            <ShoppingBag className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-semibold text-lg">No orders yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your purchased tracks will appear here with download links.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              {/* Order header */}
              <div className="px-5 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs text-muted-foreground">Order · {formatDate(order.createdAt)}</div>
                  <div className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                    {order.paypalCaptureId ?? order.paypalOrderId ?? order.id}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold">€{order.totalAmount.toFixed(2)}</span>
                  {order.paymentMethod && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                      {order.paymentMethod}
                    </span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order items */}
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div key={item.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                    {/* Artwork */}
                    <div
                      className="w-12 h-12 rounded-xl shrink-0 bg-cover bg-center bg-muted"
                      style={item.track.coverUrl ? { backgroundImage: `url(${item.track.coverUrl})` } : {}}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{item.track.title}</div>
                      <div className="text-xs text-muted-foreground">{item.track.genre} · €{item.price.toFixed(2)}</div>
                    </div>

                    {/* What's included tags */}
                    <div className="hidden sm:flex items-center gap-1 flex-wrap">
                      {["WAV", "Stems", "MIDI", "Legal Docs"].map((f) => (
                        <span key={f} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* Download button */}
                    {order.status === "COMPLETED" ? (
                      <button
                        onClick={() => handleDownload(order.id, item.id, item.track.title)}
                        disabled={downloadingItem === item.id}
                        className="shrink-0 h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[--color-primary-hover] transition disabled:opacity-60"
                      >
                        {downloadingItem === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        Download
                      </button>
                    ) : (
                      <span className="shrink-0 text-xs text-muted-foreground px-3 py-1.5 bg-muted rounded-full">
                        {order.status === "PENDING" ? "Awaiting payment" : "Unavailable"}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Completed footer */}
              {order.status === "COMPLETED" && (
                <div className="px-5 py-3 bg-green-50 border-t border-green-100 flex items-center gap-2 text-xs text-green-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Full copyright transferred. Download links valid for 1 hour — regenerate anytime.
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
