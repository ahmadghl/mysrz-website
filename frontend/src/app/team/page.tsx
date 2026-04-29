"use client";
import { useEffect, useState } from "react";
import NavLayout from "@/components/NavLayout";
import { api } from "@/lib/api";
import type { TeamMember } from "@/types";
import { Users, Plus, Trash2, Shield, X, Check, Loader2 } from "lucide-react";

const ROLES = ["admin", "editor", "viewer"] as const;
const ROLE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  admin: { bg: "#fef9e3", color: "#b8860b", border: "#f5e07a" },
  editor: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  viewer: { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" },
};

const s = {
  card: { background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, padding: "16px 20px" } as React.CSSProperties,
  btn: { background: "#f5c518", color: "#7a5c00", fontWeight: 700, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } as React.CSSProperties,
  input: { width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 14px", fontSize: 13, color: "#111", outline: "none", boxSizing: "border-box" as const },
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.4px" },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13 },
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin"|"editor"|"viewer">("viewer");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { api.team.list().then(setMembers).finally(() => setLoading(false)); }, []);

  const invite = async () => {
    if (!email.trim()) return;
    setInviting(true); setError(""); setSuccess("");
    try {
      const m = await api.team.invite({ email: email.trim(), role });
      setMembers((prev) => [...prev, m]);
      setEmail("");
      setSuccess(`Invitation sent to ${email}`);
    } catch (e: any) { setError(e.message); }
    finally { setInviting(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    try { await api.team.remove(id); setMembers((prev) => prev.filter((m) => m.id !== id)); }
    catch (e: any) { setError(e.message); }
  };

  const updateRole = async (id: string, newRole: string) => {
    try { await api.team.updateRole(id, newRole); setMembers((prev) => prev.map((m) => m.id === id ? { ...m, role: newRole } : m)); }
    catch (e: any) { setError(e.message); }
  };

  return (
    <NavLayout>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, fontFamily: "Inter,sans-serif" }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Team</h1>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>Manage team members and their access</p>
        </div>

        {error && <div style={s.error}>{error}</div>}
        {success && <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", padding: "10px 14px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><Check size={14} />{success}</div>}

        {/* Invite */}
        <div style={s.card}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: "0 0 14px" }}>Invite Team Member</p>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com" style={s.input} />
            </div>
            <div style={{ width: 140 }}>
              <label style={s.label}>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as any)} style={s.input}>
                {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <button onClick={invite} disabled={inviting || !email.trim()}
            style={{ ...s.btn, marginTop: 12, opacity: inviting || !email.trim() ? 0.45 : 1 }}>
            {inviting ? <Loader2 size={14} /> : <Plus size={14} />}{inviting ? "Sending…" : "Send Invite"}
          </button>
        </div>

        {/* Members list */}
        <div style={s.card}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: "0 0 14px" }}>
            Team Members <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 400 }}>({members.length})</span>
          </p>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "#f5c518" }} />
            </div>
          ) : members.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Users size={32} style={{ color: "#e5e7eb", margin: "0 auto 8px" }} />
              <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>No team members yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {members.map((member) => {
                const rc = ROLE_COLORS[member.role] || ROLE_COLORS.viewer;
                return (
                  <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f5c518", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#7a5c00" }}>{member.email.charAt(0).toUpperCase()}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.email}</p>
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
                        {member.status === "pending" ? "Invitation pending" : "Active"}
                      </p>
                    </div>
                    <select value={member.role} onChange={(e) => updateRole(member.id, e.target.value)}
                      style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, border: `1px solid ${rc.border}`, background: rc.bg, color: rc.color, cursor: "pointer", outline: "none" }}>
                      {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                    </select>
                    <button onClick={() => remove(member.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#e5e7eb", padding: 4, borderRadius: 6 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </NavLayout>
  );
}
