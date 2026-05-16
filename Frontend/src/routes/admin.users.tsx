import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useAdminUsers } from "@/hooks/use-api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: AdminUsers,
});

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-red-50 text-red-600",
  seller: "bg-emerald-50 text-emerald-600",
  buyer: "bg-blue-50 text-blue-600",
};

function AdminUsers() {
  const { data: users = [], isLoading } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const qc = useQueryClient();

  const filtered = users.filter((u: any) =>
    (u.display_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const changeRole = async (userId: string, role: string) => {
    setUpdatingId(userId);
    const { error } = await (supabase as any).from("profiles").update({ role }).eq("id", userId);
    if (error) toast.error(error.message);
    else { toast.success("Role updated."); qc.invalidateQueries({ queryKey: ["admin-users"] }); }
    setUpdatingId(null);
  };

  return (
    <>
      <div className="mb-8">
        <div className="label-eyebrow mb-2">Admin · Users</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">User Management</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm"
        />
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 hidden md:table-cell">Joined</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user: any) => (
                <tr key={user.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-white text-xs font-semibold shrink-0">
                        {(user.display_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{user.display_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_STYLES[user.role] ?? "bg-muted text-muted-foreground"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {updatingId === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary ml-auto" />
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                        className="h-8 px-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-primary/40"
                      >
                        <option value="buyer">buyer</option>
                        <option value="seller">seller</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">No users found.</div>
          )}
        </div>
      )}
    </>
  );
}
