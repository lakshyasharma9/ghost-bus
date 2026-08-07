// Mock data for the GhostBus Admin Panel. Pure data, no side effects.

export type Status =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "suspended"
  | "completed"
  | "failed"
  | "refunded"
  | "open"
  | "resolved"
  | "processed"
  | "requested"
  | "paused"
  | "delivered"
  | "in_progress"
  | "disputed";

const seedNames = [
  "Marcus Hill", "Aria Chen", "Devon Cole", "Sasha Petrov", "Liam Okafor",
  "Naomi Vega", "Theo Park", "Mira Patel", "Jonas Reed", "Eva Lindqvist",
  "Kai Nakamura", "Zoe Martin", "Felix Brand", "Iris Hassan", "Oscar Lee",
  "Nina Costa", "Rhys Walker", "Yuki Tanaka", "Hugo Silva", "Lena Becker",
];

const genres = ["Hip-Hop", "Trap", "R&B", "House", "Techno", "Drill", "Afrobeats", "Lo-fi", "Pop", "Cinematic"];
const trackTitles = [
  "Midnight Static", "Velvet Skies", "Phantom Drift", "Neon Crowns", "Lost Frequencies",
  "Echo Chamber", "Golden Hour", "Cold Bloom", "Paper Tigers", "Slow Burn",
  "Glass Houses", "Smoke Rings", "Dream State", "After Hours", "North Star",
  "Heatwave", "Last Call", "Silver Lining", "Wildfire", "Ghost Town",
];

const rand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};
const r = rand(42);

const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
const dateDaysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "BUYER" | "SELLER" | "MASTER_ADMIN";
  status: "active" | "suspended";
  verified: boolean;
  kyc: "none" | "pending" | "approved" | "rejected";
  joined: string;
  avatar: string;
}

export const users: User[] = seedNames.map((name, i) => ({
  id: `u_${1000 + i}`,
  name,
  email: name.toLowerCase().replace(" ", ".") + "@ghostbus.io",
  username: name.toLowerCase().replace(" ", "_"),
  role: i < 12 ? "SELLER" : "BUYER",
  status: i === 3 || i === 11 ? "suspended" : "active",
  verified: i % 3 !== 0,
  kyc: i < 12 ? (["approved", "approved", "pending", "rejected"][i % 4] as User["kyc"]) : "none",
  joined: dateDaysAgo(180 - i * 7),
  avatar: `https://i.pravatar.cc/80?img=${i + 1}`,
}));

export interface Track {
  id: string;
  title: string;
  sellerId: string;
  seller: string;
  genre: string;
  bpm: number;
  keySig: string;
  price: number;
  status: "pending" | "approved" | "rejected";
  plays: number;
  uploaded: string;
  cover: string;
  transparency: "original" | "contains_loops";
}

export const tracks: Track[] = Array.from({ length: 32 }).map((_, i) => {
  const sellerIdx = i % 12;
  const status: Track["status"] =
    i < 9 ? "pending" : i < 26 ? "approved" : "rejected";
  return {
    id: `t_${2000 + i}`,
    title: trackTitles[i % trackTitles.length] + (i >= 20 ? " II" : ""),
    sellerId: users[sellerIdx].id,
    seller: users[sellerIdx].name,
    genre: genres[i % genres.length],
    bpm: 80 + ((i * 7) % 80),
    keySig: ["C min", "G maj", "F# min", "D maj", "A min", "E maj"][i % 6],
    price: [19, 29, 39, 49, 79, 99][i % 6],
    status,
    plays: Math.floor(50 + r() * 12000),
    uploaded: dateDaysAgo(i * 2),
    cover: `https://picsum.photos/seed/track${i}/200/200`,
    transparency: i % 3 === 0 ? "contains_loops" : "original",
  };
});

export interface SellerApplication {
  id: string;
  userId: string;
  applicant: string;
  email: string;
  artistName: string;
  genre: string;
  years: number;
  portfolio: string[];
  bio: string;
  submitted: string;
  status: "pending" | "approved" | "rejected";
}

export const sellerApplications: SellerApplication[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `app_${3000 + i}`,
  userId: users[(i + 5) % users.length].id,
  applicant: users[(i + 5) % users.length].name,
  email: users[(i + 5) % users.length].email,
  artistName: trackTitles[i % trackTitles.length].split(" ")[0],
  genre: genres[i % genres.length],
  years: 1 + (i % 9),
  portfolio: ["https://soundcloud.com/example", "https://spotify.com/artist/x"],
  bio: "Independent producer with a focus on cinematic textures and modern percussion.",
  submitted: dateDaysAgo(i + 1),
  status: i < 6 ? "pending" : i < 11 ? "approved" : "rejected",
}));

export interface Order {
  id: string;
  buyerId: string;
  buyer: string;
  trackCount: number;
  total: number;
  status: "pending" | "completed" | "failed" | "refunded";
  stripeId: string;
  created: string;
}

export const orders: Order[] = Array.from({ length: 26 }).map((_, i) => ({
  id: `ord_${4000 + i}`,
  buyerId: users[12 + (i % 8)].id,
  buyer: users[12 + (i % 8)].name,
  trackCount: 1 + (i % 4),
  total: 19 + (i * 13) % 240,
  status: i < 18 ? "completed" : i < 22 ? "pending" : i < 24 ? "refunded" : "failed",
  stripeId: `pi_3O${Math.floor(r() * 1e9).toString(36)}`,
  created: dateDaysAgo(i),
}));

export interface Refund {
  id: string; orderId: string; buyer: string; amount: number;
  reason: string; status: "requested" | "approved" | "rejected"; requested: string;
}
export const refunds: Refund[] = Array.from({ length: 9 }).map((_, i) => ({
  id: `rf_${5000 + i}`,
  orderId: orders[i].id,
  buyer: orders[i].buyer,
  amount: orders[i].total,
  reason: ["Track not as described", "Accidental purchase", "Duplicate", "Quality issue", "Wrong file"][i % 5],
  status: i < 4 ? "requested" : i < 7 ? "approved" : "rejected",
  requested: dateDaysAgo(i),
}));

export interface Dispute {
  id: string; orderId: string; buyer: string; seller: string;
  claim: string; status: "open" | "resolved"; outcome?: "buyer_favor" | "seller_favor";
  opened: string;
}
export const disputes: Dispute[] = Array.from({ length: 7 }).map((_, i) => ({
  id: `dsp_${6000 + i}`,
  orderId: orders[i + 2].id,
  buyer: orders[i + 2].buyer,
  seller: users[i % 12].name,
  claim: ["Stems were missing", "Track contained uncleared sample", "File corrupted", "Different version than preview"][i % 4],
  status: i < 4 ? "open" : "resolved",
  outcome: i >= 4 ? (i % 2 === 0 ? "buyer_favor" : "seller_favor") : undefined,
  opened: dateDaysAgo(i + 1),
}));

export interface Withdrawal {
  id: string; sellerId: string; seller: string; amount: number;
  stripeAcct: string; status: "pending" | "processed" | "rejected";
  requested: string; processed?: string;
}
export const withdrawals: Withdrawal[] = Array.from({ length: 11 }).map((_, i) => ({
  id: `w_${7000 + i}`,
  sellerId: users[i % 12].id,
  seller: users[i % 12].name,
  amount: 120 + (i * 87) % 1800,
  stripeAcct: `acct_1O${Math.floor(r() * 1e8).toString(36)}`,
  status: i < 5 ? "pending" : i < 9 ? "processed" : "rejected",
  requested: dateDaysAgo(i + 1),
  processed: i >= 5 && i < 9 ? dateDaysAgo(i - 1) : undefined,
}));

export interface KycSubmission {
  id: string; sellerId: string; seller: string; docType: string;
  submitted: string; status: "pending" | "approved" | "rejected"; reason?: string;
}
export const kycSubmissions: KycSubmission[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `kyc_${8000 + i}`,
  sellerId: users[i].id,
  seller: users[i].name,
  docType: ["Passport", "Driver's License", "National ID"][i % 3],
  submitted: dateDaysAgo(i + 1),
  status: i < 5 ? "pending" : i < 8 ? "approved" : "rejected",
  reason: i >= 8 ? "Document blurry, please resubmit." : undefined,
}));

export interface Gig {
  id: string; title: string; seller: string; category: string;
  price: number; status: "active" | "paused" | "pending"; orders: number; rating: number; created: string;
}
export const gigs: Gig[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `gig_${9000 + i}`,
  title: ["Custom Trap Beat", "Mix & Master", "Vocal Tuning", "Full Production", "Stems Cleanup"][i % 5],
  seller: users[i % 12].name,
  category: ["Production", "Mixing", "Mastering", "Editing"][i % 4],
  price: 49 + (i * 31) % 400,
  status: i < 8 ? "active" : i < 10 ? "paused" : "pending",
  orders: Math.floor(r() * 80),
  rating: 4 + r(),
  created: dateDaysAgo(i * 4),
}));

export interface NotificationItem {
  id: string; title: string; type: "info" | "success" | "warning" | "alert";
  target: string; recipients: number; sentBy: string; sentAt: string; readRate: number;
}
export const notifications: NotificationItem[] = Array.from({ length: 9 }).map((_, i) => ({
  id: `n_${i}`,
  title: [
    "Holiday sale starts Friday",
    "New seller verification policy",
    "Stripe payouts delayed",
    "Platform maintenance Sunday 2am UTC",
    "New genre tags available",
  ][i % 5],
  type: (["info", "success", "warning", "alert"] as const)[i % 4],
  target: ["All users", "Sellers", "Buyers", "All users"][i % 4],
  recipients: 1200 + i * 410,
  sentBy: "admin@ghostbus.io",
  sentAt: dateDaysAgo(i),
  readRate: 0.4 + r() * 0.5,
}));

export interface ContentBlock {
  id: string; key: string; title: string; body: string;
  imageUrl?: string; isActive: boolean; updatedAt: string; updatedBy: string;
}
export const contentBlocks: ContentBlock[] = [
  { id: "c1", key: "hero", title: "Ghost-produced. Studio-grade.", body: "Buy beats, stems, and full productions from vetted ghost producers.", imageUrl: "https://picsum.photos/seed/hero/600/300", isActive: true, updatedAt: dateDaysAgo(2), updatedBy: "admin@ghostbus.io" },
  { id: "c2", key: "homepage_featured", title: "Featured tracks", body: "Hand-picked this week", isActive: true, updatedAt: dateDaysAgo(5), updatedBy: "admin@ghostbus.io" },
  { id: "c3", key: "announcement", title: "0% fees on your first sale", body: "Limited time for new sellers", isActive: false, updatedAt: dateDaysAgo(10), updatedBy: "admin@ghostbus.io" },
  { id: "c4", key: "how_it_works", title: "How it works", body: "Apply → Upload → Get approved → Sell.", isActive: true, updatedAt: dateDaysAgo(20), updatedBy: "admin@ghostbus.io" },
  { id: "c5", key: "footer", title: "Footer", body: "© GhostBus Audio. All rights reserved.", isActive: true, updatedAt: dateDaysAgo(40), updatedBy: "admin@ghostbus.io" },
];

export interface FeatureFlag { id: string; name: string; description: string; enabled: boolean; updatedAt: string; updatedBy: string; critical?: boolean; }
export const featureFlags: FeatureFlag[] = [
  { id: "f1", name: "enable_gigs", description: "Show/hide the Gigs section on the marketplace.", enabled: true, updatedAt: dateDaysAgo(3), updatedBy: "admin@ghostbus.io" },
  { id: "f2", name: "enable_hero_video", description: "Use video instead of image in the hero section.", enabled: false, updatedAt: dateDaysAgo(7), updatedBy: "admin@ghostbus.io" },
  { id: "f3", name: "enable_seller_applications", description: "Open or close new seller applications.", enabled: true, updatedAt: dateDaysAgo(15), updatedBy: "admin@ghostbus.io" },
  { id: "f4", name: "enable_stripe_payments", description: "Enable Stripe checkout platform-wide.", enabled: true, updatedAt: dateDaysAgo(1), updatedBy: "admin@ghostbus.io", critical: true },
  { id: "f5", name: "enable_withdrawals", description: "Allow sellers to request withdrawals.", enabled: true, updatedAt: dateDaysAgo(2), updatedBy: "admin@ghostbus.io" },
  { id: "f6", name: "maintenance_mode", description: "Put the platform in maintenance mode.", enabled: false, updatedAt: dateDaysAgo(60), updatedBy: "admin@ghostbus.io", critical: true },
  { id: "f7", name: "enable_reviews", description: "Show/hide the review system.", enabled: true, updatedAt: dateDaysAgo(30), updatedBy: "admin@ghostbus.io" },
  { id: "f8", name: "enable_wishlist", description: "Show/hide the wishlist feature.", enabled: true, updatedAt: dateDaysAgo(45), updatedBy: "admin@ghostbus.io" },
];

export interface AuditLog {
  id: string; admin: string; ip: string; action: string;
  entity: string; entityId: string; createdAt: string;
}
export const auditLogs: AuditLog[] = Array.from({ length: 28 }).map((_, i) => ({
  id: `log_${10000 + i}`,
  admin: "admin@ghostbus.io",
  ip: `203.0.113.${10 + i}`,
  action: [
    "TRACK_APPROVED", "TRACK_REJECTED", "USER_SUSPENDED", "USER_RESTORED",
    "REFUND_PROCESSED", "DISPUTE_RESOLVED", "KYC_APPROVED", "KYC_REJECTED",
    "WITHDRAWAL_APPROVED", "FEATURE_FLAG_TOGGLED", "CONTENT_UPDATED",
    "COMMISSION_RATE_CHANGED", "SELLER_TIER_ASSIGNED", "BROADCAST_SENT", "ADMIN_LOGIN",
  ][i % 15],
  entity: ["Track", "User", "Refund", "Dispute", "KYC", "Withdrawal", "FeatureFlag", "Content"][i % 8],
  entityId: `e_${i + 1}`,
  createdAt: dateDaysAgo(i / 3),
}));

export interface SellerTier { id: string; name: string; commissionRate: number; minSales: number; description: string; sellers: number; }
export const sellerTiers: SellerTier[] = [
  { id: "tier_1", name: "New", commissionRate: 36, minSales: 0, description: "Default tier for new approved sellers.", sellers: 5 },
  { id: "tier_2", name: "Established", commissionRate: 30, minSales: 25, description: "Sellers with consistent monthly sales.", sellers: 4 },
  { id: "tier_3", name: "Premium", commissionRate: 25, minSales: 100, description: "Top-performing sellers with strong ratings.", sellers: 3 },
];

// Analytics
export const revenueDaily = Array.from({ length: 30 }).map((_, i) => ({
  day: `D${i + 1}`,
  revenue: Math.floor(800 + Math.sin(i / 3) * 400 + r() * 600),
  commission: Math.floor(200 + Math.sin(i / 3) * 100 + r() * 180),
}));
export const usersGrowth = Array.from({ length: 12 }).map((_, i) => ({
  month: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
  users: 800 + i * 220 + Math.floor(r() * 200),
}));
export const genreRevenue = genres.slice(0, 6).map((g, i) => ({ genre: g, value: 1500 + i * 700 + Math.floor(r() * 800) }));

export const dashboardStats = {
  totalUsers: users.length * 184,
  activeSellers: users.filter(u => u.role === "SELLER" && u.kyc === "approved").length * 42,
  totalRevenue: 482910,
  monthRevenue: 38420,
  pendingTracks: tracks.filter(t => t.status === "pending").length,
  openDisputes: disputes.filter(d => d.status === "open").length,
  pendingRefunds: refunds.filter(r => r.status === "requested").length,
  pendingApplications: sellerApplications.filter(a => a.status === "pending").length,
};

export const fmtMoney = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
export const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const fmtDateTime = (s: string) => new Date(s).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
