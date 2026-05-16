import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Home, ShoppingBag, Heart, Users, User, Mail, LogOut } from "lucide-react";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
});

function AccountLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#5BA7FF] grid place-items-center text-white font-bold text-sm animate-pulse">
            G
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) return null;

  const firstName = user.user_metadata?.first_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <Navbar />

      <div className="container-app py-8 flex-1">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 shrink-0">
            <nav className="sticky top-20 space-y-1">
              <NavLink to="/account" icon={<Home className="w-4 h-4" />}>
                Account Overview
              </NavLink>
              <NavLink to="/apply-seller" icon={<User className="w-4 h-4" />}>
                Start Selling
              </NavLink>
              <NavLink to="/account/orders" icon={<ShoppingBag className="w-4 h-4" />}>
                My Orders
              </NavLink>
              <NavLink to="/account/favorites" icon={<Heart className="w-4 h-4" />}>
                Favorites
              </NavLink>
              <NavLink to="/account/following" icon={<Users className="w-4 h-4" />}>
                Following
              </NavLink>
              <NavLink to="/account/profile" icon={<User className="w-4 h-4" />}>
                Edit Profile
              </NavLink>
              <NavLink to="/account/mailing" icon={<Mail className="w-4 h-4" />}>
                Mailing
              </NavLink>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function NavLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted rounded-xl transition-colors"
      activeProps={{ className: "bg-accent text-primary font-medium" }}
    >
      {icon}
      {children}
    </Link>
  );
}
