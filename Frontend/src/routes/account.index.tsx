import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuthContext } from "@/contexts/AuthContext";
import { SellerModeToggle } from "@/components/auth/SellerModeToggle";
import { useEffect } from "react";

export const Route = createFileRoute("/account/")({
  component: AccountOverview,
});

function AccountOverview() {
  const { user, profile, sellerModeEnabled } = useAuthContext();
  const navigate = useNavigate();

  // If seller mode is actively enabled, redirect to seller dashboard
  useEffect(() => {
    if (sellerModeEnabled) {
      navigate({ to: "/dashboard" });
    }
  }, [sellerModeEnabled, navigate]);

  const email = user?.email ?? "";
  const fullName = user?.fullName ?? email.split("@")[0];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Welcome back</h1>
        <p className="text-4xl font-bold text-primary">{fullName}</p>
        <p className="text-sm text-muted-foreground mt-2">Buyer Dashboard</p>
      </div>

      {/* Seller Mode Toggle — handles all states: not applied, pending, rejected, approved */}
      <SellerModeToggle />

      {/* Account Overview Card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Account Overview</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-24">Email</span>
            <span className="text-sm font-medium">{email}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-24">Role</span>
            <span className="text-sm font-medium capitalize">{user?.role?.toLowerCase() ?? "buyer"}</span>
          </div>
          {user?.sellerApplicationStatus && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-24">Seller Status</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                user.sellerApplicationStatus === 'pending'
                  ? "bg-amber-100 text-amber-800"
                  : user.sellerApplicationStatus === 'approved'
                  ? "bg-green-100 text-green-800"
                  : "bg-rose-100 text-rose-800"
              }`}>
                {user.sellerApplicationStatus.charAt(0).toUpperCase() + user.sellerApplicationStatus.slice(1)}
              </span>
            </div>
          )}
        </div>
        <Link
          to="/account/profile"
          className="mt-6 inline-flex h-10 px-6 items-center rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[--color-primary-hover] transition"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
