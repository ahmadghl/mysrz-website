"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavLayout from "@/components/NavLayout";
import { api } from "@/lib/api";
import type { Domain } from "@/types";
import { Globe, Plus, Trash2, Activity, Clock, Zap, RefreshCw, ExternalLink } from "lucide-react";

const s = {
  card: { background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, padding: "16px 20px" } as React.CSSProperties,
  label: { fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.5px", margin: 0 },
  bigNum: { fontSize: 22, fontWeight: 700, color: "#111", marginTop: 4, marginBottom: 2 },
  sub: { fontSize: 11, color: "#d1d5db", margin: 0 },
  btnPrimary: { background: "#f5c518", color: "#7a5c00", fontWeight: 700, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } as React.CSSProperties,
  btnGhost: { background: "#fff", color: "#374151", fontWeight: 500, border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } as React.CSSProperties,
  input: { width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 12px 9px 32px", fontSize: 13, color: "#111", outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" as const },
  alertError: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13 },
};

export default function DashboardPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [addUrl, setAddUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [error, setError] = useState("");

  const fetchDomains = async () => {
    try { const data = await api.domains.list(); setDomains(data); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDomains(); }, []);

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!addUrl.trim()) return;
    setAdding(true); setError("");
    try {
      const domain = await api.domains.add(addUrl.trim());
      setDomains((prev) => [domain, ...prev]);
      setAddUrl("");
    } catch (e: any) { setError(e.message); }
    finally { setAdding(false); }
  };

  const toggleSelect = async (id: string) => {
    try {
      await api.domains.toggleSelect(id);
      setDomains((prev) => prev.map((d) => d.id === id ? { ...d, is_selected: !d.is_selected } : d));
    } catch (e: any) { setError(e.message); }
  };

  const deleteDomain = async (id: string) => {
    if (!confirm("Delete this domain and all its data?")) return;
    try {
      await api.domains.delete(id);
      setDomains((prev) => prev.filter((d) => d.id !== id));
    } catch (e: any) { setError(e.message); }
  };

  const startCrawl = async () => {
    const selected = domains.filter((d) => d.is_selected);
    if (!selected.length) { setError("Select at least one domain first"); return; }
    setCrawling(true); setError("");
    try {
      const job = await api.crawl.start();
      router.push(`/crawl?job_id=${job.job_id}`);
    } catch (e: any) { setError(e.message); setCrawling(false); }
  };

  const selectedCount = domains.filter((d) => d.is_selected).length;
  const totalPages = domains.reduce((sum, d) => sum + (d.pages_crawled || 0), 0);
  const lastCrawl = domains.reduce((latest, d) => {
    if (!d.last_crawl_at) return latest;
    return !latest || new Date(d.last_crawl_at) > new Date(latest) ? d.last_crawl_at : latest;
  }, "" as string);

  return (
    <NavLayout>
      <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16, fontFamily: "Inter, sans-serif" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Domains</h1>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>Manage websites to crawl and index</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={fetchDomains} style={s.btnGhost}>
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={startCrawl} disabled={crawling || selectedCount === 0}
              style={{ ...s.btnPrimary, opacity: (crawling || selectedCount === 0) ? 0.45 : 1, cursor: (crawling || selectedCount === 0) ? "not-allowed" : "pointer" }}>
              <Zap size={14} />{crawling ? "Starting…" : `Crawl Selected (${selectedCount})`}
            </button>
          </div>
        </div>

        {error && <div style={s.alertError}>{error}</div>}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div style={s.card}>
            <p style={s.label}>Total Pages</p>
            <p style={s.bigNum}>{totalPages.toLocaleString()}</p>
            <p style={s.sub}>{domains.length} domain{domains.length !== 1 ? "s" : ""}</p>
          </div>
          <div style={s.card}>
            <p style={s.label}>Last Crawl</p>
            <p style={{ ...s.bigNum, fontSize: 16, color: "#b8860b" }}>{lastCrawl ? new Date(lastCrawl).toLocaleDateString() : "Never"}</p>
            <p style={s.sub}>{lastCrawl ? new Date(lastCrawl).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</p>
          </div>
          <div style={s.card}>
            <p style={s.label}>Selected</p>
            <p style={s.bigNum}>{selectedCount}</p>
            <p style={s.sub}>ready to crawl</p>
          </div>
        </div>

        {/* Add Domain */}
        <div style={{ ...s.card, display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Globe size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input value={addUrl} onChange={(e) => setAddUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              placeholder="https://example.com" style={s.input} />
          </div>
          <button onClick={handleAdd} disabled={adding || !addUrl.trim()}
            style={{ ...s.btnPrimary, whiteSpace: "nowrap", opacity: (adding || !addUrl.trim()) ? 0.45 : 1 }}>
            <Plus size={14} />{adding ? "Adding…" : "Add Domain"}
          </button>
        </div>

        {/* Domain List */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
            <div style={{ width: 24, height: 24, border: "2px solid #e5e7eb", borderTopColor: "#f5c518", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        ) : domains.length === 0 ? (
          <div style={{ ...s.card, padding: "48px 20px", textAlign: "center" }}>
            <Globe size={36} style={{ color: "#e5e7eb", margin: "0 auto 12px" }} />
            <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>No domains yet. Add your first website above.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {domains.map((domain) => (
              <div key={domain.id} onClick={() => toggleSelect(domain.id)}
                style={{
                  ...s.card,
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", transition: "all 0.15s",
                  borderColor: domain.is_selected ? "#f5c518" : "#ebebeb",
                  background: domain.is_selected ? "#fffdf0" : "#fff",
                }}>
                {/* Checkbox */}
                <div style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 4,
                  background: domain.is_selected ? "#fef9e3" : "#fff",
                  border: `1.5px solid ${domain.is_selected ? "#f5c518" : "#e5e7eb"}`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {domain.is_selected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#d4a017" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{domain.url}</span>
                    <a href={domain.url} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: "#d1d5db", flexShrink: 0, display: "flex" }}>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                      <Activity size={10} />{domain.pages_crawled.toLocaleString()} pages
                    </span>
                    {domain.last_crawl_at && (
                      <span style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={10} />{new Date(domain.last_crawl_at).toLocaleDateString()}
                      </span>
                    )}
                    <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: domain.status === "crawling" ? "#d97706" : domain.status === "error" ? "#ef4444" : "#d1d5db" }}>
                      {domain.status === "crawling" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f5c518", display: "inline-block", animation: "pulse 1.5s infinite" }} />}
                      {domain.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  {domain.is_selected && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#fef9e3", color: "#b8860b", border: "1px solid #f5e07a" }}>
                      Selected
                    </span>
                  )}
                  <button onClick={() => deleteDomain(domain.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#e5e7eb", padding: "4px 6px", borderRadius: 6 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>
    </NavLayout>
  );
}
