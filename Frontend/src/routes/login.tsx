import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { authAPI } from "@/lib/api-client";
import { useAuthContext } from "@/contexts/AuthContext";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — GhostBus" }] }),
  component: Auth,
});

function Auth() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuthContext();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    // Validation for signup
    if (tab === "signup") {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
    }

    setBusy(true);
    try {
      if (tab === "signup") {
        const { data } = await authAPI.signup({
          email,
          password,
          fullName,
        });
        
        // Store tokens
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        
        // Refresh profile to update auth state
        await refreshProfile();
        
        toast.success("Account created! Welcome to GhostBus.");
        navigate({ to: "/" });
      } else {
        const { data } = await authAPI.login({
          email,
          password,
        });
        
        // Store tokens
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        
        // Refresh profile to update auth state
        await refreshProfile();
        
        toast.success("Welcome back!");
        navigate({ to: "/" });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const message = err.response?.data?.message || err.message || "Authentication failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#060226] to-[#1a0a5e] grid place-items-center text-white font-bold text-lg shadow-[0_8px_24px_rgba(6,2,38,0.45)]">
            G
          </div>
          <span className="font-semibold tracking-tight text-2xl">GhostBus</span>
        </Link>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {tab === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {tab === "login" ? "Sign in to your GhostBus account" : "Join the premium ghost production marketplace"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="inline-flex w-full p-1 rounded-full bg-muted text-sm mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 h-10 rounded-full transition ${tab === "login" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
            >
              Log in
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 h-10 rounded-full transition ${tab === "signup" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
            >
              Sign up
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={submit}>
            {tab === "signup" && (
              <Field
                label="Full Name"
                type="text"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            <Field
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Field
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {tab === "signup" && (
              <Field
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            <button
              disabled={busy}
              className="w-full h-12 mt-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[0_10px_30px_rgba(6,2,38,0.35)] hover:bg-[--color-primary-hover] transition disabled:opacity-60"
            >
              {busy ? "Please wait..." : tab === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link to="/terms" className="underline hover:text-foreground">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Back to Home */}
        <Link
          to="/"
          className="mt-6 flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        {...props}
        className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm"
      />
    </div>
  );
}
