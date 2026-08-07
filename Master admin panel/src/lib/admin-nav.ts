import {
  LayoutDashboard, Users, FileCheck2, Store, Music, Shield, IdCard,
  ShoppingCart, RotateCcw, AlertOctagon, Wallet, BarChart3, Briefcase,
  Bell, FileText, ToggleLeft, ScrollText, Settings, Layers, Search, TrendingDown,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  badgeKey?: "pendingApplications" | "pendingTracks" | "pendingKyc";
  section: string;
};

export const navItems: NavItem[] = [
  { section: "Overview", to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { section: "People", to: "/admin/users", label: "Users", icon: Users },
  { section: "People", to: "/admin/seller-applications", label: "Seller Applications", icon: FileCheck2, badgeKey: "pendingApplications" },
  { section: "People", to: "/admin/sellers", label: "Sellers", icon: Store },
  { section: "Content", to: "/admin/tracks", label: "Tracks", icon: Music },
  { section: "Content", to: "/admin/moderation", label: "Moderation Queue", icon: Shield, badgeKey: "pendingTracks" },
  { section: "Content", to: "/admin/kyc", label: "KYC Review", icon: IdCard, badgeKey: "pendingKyc" },
  { section: "Content", to: "/admin/recently-sold", label: "Recently Sold", icon: TrendingDown },
  { section: "Commerce", to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { section: "Commerce", to: "/admin/refunds", label: "Refunds", icon: RotateCcw },
  { section: "Commerce", to: "/admin/disputes", label: "Disputes", icon: AlertOctagon },
  { section: "Commerce", to: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
  { section: "Insights", to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { section: "Insights", to: "/admin/gigs", label: "Gigs", icon: Briefcase },
  { section: "Platform", to: "/admin/notifications", label: "Notifications", icon: Bell },
  { section: "Platform", to: "/admin/blog", label: "Blog", icon: FileText },
  { section: "Platform", to: "/admin/content", label: "Content Management", icon: FileText },
  { section: "Platform", to: "/admin/feature-flags", label: "Feature Flags", icon: ToggleLeft },
  { section: "System", to: "/admin/logs", label: "Audit Logs", icon: ScrollText },
  { section: "System", to: "/admin/search", label: "Global Search", icon: Search },
  { section: "System", to: "/admin/seller-tiers", label: "Seller Tiers", icon: Layers },
  { section: "System", to: "/admin/settings", label: "Settings", icon: Settings },
];

export const sections = ["Overview", "People", "Content", "Commerce", "Insights", "Platform", "System"];
