import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Input } from "@/components/admin/ui";
import { Shield } from "lucide-react";
import { authAPI, setToken, setRefreshToken } from "@/lib/api";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await authAPI.login(email, password);
      if (data.user.role !== "ADMIN") {
        setError("Access denied. Admin accounts only.");
        setLoading(false);
        return;
      }
      setToken(data.accessToken);
      if (data.refreshToken) setRefreshToken(data.refreshToken);
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[oklch(0.97_0.01_247)] px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="h-11 w-11 rounded-xl bg-primary grid place-items-center text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-lg font-semibold">GhostBus Admin</h1>
          <p className="text-xs text-muted-foreground mt-1">Secure master admin access</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <Input
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@ghostbus.io"
              className="w-full mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <Input
              type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center mt-3">
            Rate limited · 5 attempts per 15 min · IP logged
          </p>
        </form>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});
