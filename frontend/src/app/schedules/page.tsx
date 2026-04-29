"use client";
import { useEffect, useState } from "react";
import NavLayout from "@/components/NavLayout";
import { api } from "@/lib/api";
import type { Schedule, Domain } from "@/types";
import { Clock, Plus, Trash2, ToggleLeft, ToggleRight, X, Check, Loader2 } from "lucide-react";

const SCHEDULE_TYPES = [
  { value: "hourly", label: "Every Hour" },
  { value: "12_hours", label: "Every 12 Hours" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom Cron" },
];

const s = {
  card: { background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, padding: "16px 20px" } as React.CSSProperties,
  btn: { background: "#f5c518", color: "#7a5c00", fontWeight: 700, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } as React.CSSProperties,
  btnGhost: { background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } as React.CSSProperties,
  input: { width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 14px", fontSize: 13, color: "#111", outline: "none", boxSizing: "border-box" as const },
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.4px" },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13 },
  overlay: { position: "fixed" as const, inset: 0, zIndex: 50, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
};

function CreateModal({ domains, onClose, onCreate }: { domains: Domain[]; onClose: () => void; onCreate: (s: Schedule) => void }) {
  const [name, setName] = useState("");
  const [domainId, setDomainId] = useState(domains[0]?.id || "");
  const [scheduleType, setScheduleType] = useState("daily");
  const [cronExpression, setCronExpression] = useState("0 2 * * *");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const schedule = await api.schedules.create({ name, domain_id: domainId, schedule_type: scheduleType, cron_expression: scheduleType === "custom" ? cronExpression : undefined });
      onCreate(schedule); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 24, width: "100%", maxWidth: 460, border: "1px solid #ebebeb" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: 0 }}>Create Schedule</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
        </div>
        {error && <div style={{ ...s.error, marginBottom: 14 }}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={s.label}>Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Daily Homepage Crawl" style={s.input} /></div>
          <div><label style={s.label}>Domain</label>
            <select value={domainId} onChange={(e) => setDomainId(e.target.value)} style={s.input}>
              {domains.map((d) => <option key={d.id} value={d.id}>{d.url}</option>)}
            </select>
          </div>
          <div><label style={s.label}>Frequency</label>
            <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)} style={s.input}>
              {SCHEDULE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {scheduleType === "custom" && (
            <div><label style={s.label}>Cron Expression</label><input value={cronExpression} onChange={(e) => setCronExpression(e.target.value)} style={s.input} /></div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={s.btnGhost}>Cancel</button>
          <button onClick={submit} disabled={loading || !name.trim()} style={{ ...s.btn, opacity: loading || !name.trim() ? 0.45 : 1 }}>
            {loading ? <Loader2 size={14} /> : <Check size={14} />}{loading ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.schedules.list(), api.domains.list()])
      .then(([s, d]) => { setSchedules(s); setDomains(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleSchedule = async (id: string, enabled: boolean) => {
    try {
      await api.schedules.toggle(id, !enabled);
      setSchedules((prev) => prev.map((s) => s.id === id ? { ...s, is_enabled: !enabled } : s));
    } catch (e: any) { setError(e.message); }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm("Delete this schedule?")) return;
    try { await api.schedules.delete(id); setSchedules((prev) => prev.filter((s) => s.id !== id)); }
    catch (e: any) { setError(e.message); }
  };

  return (
    <NavLayout>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, fontFamily: "Inter,sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Schedules</h1>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>Automate your crawls on a schedule</p>
          </div>
          <button onClick={() => setShowModal(true)} style={s.btn}><Plus size={14} />New Schedule</button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <div style={{ width: 24, height: 24, border: "2px solid #e5e7eb", borderTopColor: "#f5c518", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        ) : schedules.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: "48px 20px" }}>
            <Clock size={36} style={{ color: "#e5e7eb", margin: "0 auto 12px" }} />
            <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>No schedules yet. Create one to automate crawls.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {schedules.map((schedule) => (
              <div key={schedule.id} style={s.card}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>{schedule.name}</p>
                    <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>{SCHEDULE_TYPES.find((t) => t.value === schedule.schedule_type)?.label || schedule.schedule_type}</span>
                      {schedule.next_run_at && <span style={{ fontSize: 11, color: "#9ca3af" }}>Next: {new Date(schedule.next_run_at).toLocaleString()}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: schedule.is_enabled ? "#fef9e3" : "#f9fafb", color: schedule.is_enabled ? "#b8860b" : "#9ca3af", border: `1px solid ${schedule.is_enabled ? "#f5e07a" : "#e5e7eb"}` }}>
                    {schedule.is_enabled ? "Active" : "Paused"}
                  </span>
                  <button onClick={() => toggleSchedule(schedule.id, schedule.is_enabled)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: schedule.is_enabled ? "#f5c518" : "#d1d5db" }}>
                    {schedule.is_enabled ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                  </button>
                  <button onClick={() => deleteSchedule(schedule.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#e5e7eb", padding: 4, borderRadius: 6 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && <CreateModal domains={domains} onClose={() => setShowModal(false)} onCreate={(s) => setSchedules((prev) => [s, ...prev])} />}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </NavLayout>
  );
}
