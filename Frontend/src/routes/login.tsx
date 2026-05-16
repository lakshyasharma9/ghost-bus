import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — GhostBus" }] }),
  component: Auth,
});

function Auth() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("United States");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: firstName,
              last_name: lastName,
              country: country,
              role: "buyer", // All users start as buyers
            },
          },
        });
        if (error) throw error;
        toast.success("Account created! Welcome to GhostBus.");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#5BA7FF] grid place-items-center text-white font-bold text-lg shadow-[0_8px_24px_rgba(10,132,255,0.35)]">
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
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="First Name"
                    type="text"
                    placeholder="John"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Field
                    label="Last Name"
                    type="text"
                    placeholder="Doe"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </>
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
              <>
                <Field
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm"
                  >
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>Germany</option>
                    <option>France</option>
                    <option>Netherlands</option>
                    <option>Spain</option>
                    <option>Italy</option>
                    <option>India</option>
                    <option>Brazil</option>
                    <option>Mexico</option>
                  </select>
                </div>
              </>
            )}

            <button
              disabled={busy}
              className="w-full h-12 mt-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[0_10px_30px_rgba(10,132,255,0.28)] hover:bg-[--color-primary-hover] transition disabled:opacity-60"
            >
              {busy ? "Please wait..." : tab === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link to="/legal" className="underline hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/legal" className="underline hover:text-foreground">
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
