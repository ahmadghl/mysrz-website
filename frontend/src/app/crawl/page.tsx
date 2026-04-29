"use client";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import NavLayout from "@/components/NavLayout";
import { useCrawlProgress } from "@/hooks/useCrawlProgress";
import { api } from "@/lib/api";
import type { CrawlHistory } from "@/types";
import { Activity, Square, Zap, Clock, Globe, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const s = {
  card: { background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, padding: "16px 20px" } as React.CSSProperties,
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  completed: <CheckCircle size={15} color="#16a34a" />,
  failed: <XCircle size={15} color="#dc2626" />,
  stopped: <AlertCircle size={15} color="#d97706" />,
  running: <Activity size={15} color="#b8860b" />,
  pending: <Clock size={15} color="#9ca3af" />,
};

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ height: 8, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "#f5c518", borderRadius: 99, transition: "width 0.5s" }} />
    </div>
  );
}

function CrawlPageInner() {
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get("job_id");
  const [activeJobId, setActiveJobId] = useState<string | null>(jobIdParam);
  const [history, setHistory] = useState<CrawlHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [stopping, setStopping] = useState(false);
  const { progress, done } = useCrawlProgress(activeJobId);

  useEffect(() => { api.crawl.history().then(setHistory).finally(() => setLoadingHistory(false)); }, []);
  useEffect(() => { if (done) setTimeout(() => api.crawl.history().then(setHistory), 1500); }, [done]);

  const stopCrawl = async () => {
    if (!activeJobId) return;
    setStopping(true);
    try { await api.crawl.stop(activeJobId); } finally { setStopping(false); }
  };

  const isRunning = progress && ["running", "pending"].includes(progress.status);

  return (
    <NavLayout>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, fontFamily: "Inter,sans-serif" }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Crawl Monitor</h1>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>Real-time crawl progress and history</p>
        </div>

        {activeJobId && (
          <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {isRunning && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f5c518", animation: "pulse 1.5s infinite", display: "inline-block" }} />}
                <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                  {isRunning ? "Crawl In Progress" : progress?.status === "completed" ? "Crawl Completed" : `Crawl ${progress?.status || "…"}`}
                </span>
              </div>
              {isRunning && (
                <button onClick={stopCrawl} disabled={stopping}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: stopping ? 0.6 : 1 }}>
                  <Square size={12} />{stopping ? "Stopping…" : "Stop Crawl"}
                </button>
              )}
            </div>
            {progress ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                    <span>Pages crawled</span>
                    <span style={{ fontWeight: 600, color: "#111", fontFamily: "monospace" }}>{progress.pages_crawled.toLocaleString()} / {progress.total_pages.toLocaleString()}</span>
                  </div>
                  <ProgressBar value={progress.pages_crawled} max={Math.max(progress.total_pages, 1)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px" }}>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Speed</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "4px 0 0", fontFamily: "monospace" }}>{progress.speed} <span style={{ fontSize: 11, fontWeight: 400, color: "#9ca3af" }}>pg/s</span></p>
                  </div>
                  <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px" }}>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Discovered</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "4px 0 0", fontFamily: "monospace" }}>{progress.total_pages.toLocaleString()}</p>
                  </div>
                </div>
                {progress.current_url && (
                  <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px" }}>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 4 }}><Globe size={11} />Currently crawling</p>
                    <p style={{ fontSize: 11, color: "#374151", margin: 0, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{progress.current_url}</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#9ca3af", fontSize: 13 }}>
                <div style={{ width: 16, height: 16, border: "2px solid #e5e7eb", borderTopColor: "#f5c518", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Connecting to crawl worker…
              </div>
            )}
          </div>
        )}

        {!activeJobId && (
          <div style={{ ...s.card, textAlign: "center", padding: "48px 20px" }}>
            <Activity size={36} style={{ color: "#e5e7eb", margin: "0 auto 12px" }} />
            <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 12px" }}>No active crawl. Go to Dashboard and start one.</p>
            <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#b8860b", fontWeight: 600, textDecoration: "none" }}>
              <Zap size={13} />Go to Dashboard
            </a>
          </div>
        )}

        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: "0 0 12px" }}>Crawl History</h2>
          {loadingHistory ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
              <div style={{ width: 20, height: 20, border: "2px solid #e5e7eb", borderTopColor: "#f5c518", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : history.length === 0 ? (
            <div style={{ ...s.card, textAlign: "center", padding: 32 }}><p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>No crawl history yet</p></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((item) => (
                <div key={item.id} onClick={() => setActiveJobId(item.id)}
                  style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "12px 16px" }}>
                  {STATUS_ICON[item.status] || STATUS_ICON.pending}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.domain_url || "Multiple domains"}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{new Date(item.started_at).toLocaleString()} · {item.pages_crawled.toLocaleString()} pages</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                    background: item.status === "completed" ? "#f0fdf4" : item.status === "failed" ? "#fef2f2" : item.status === "running" ? "#fef9e3" : "#f9fafb",
                    color: item.status === "completed" ? "#16a34a" : item.status === "failed" ? "#dc2626" : item.status === "running" ? "#b8860b" : "#9ca3af",
                    border: `1px solid ${item.status === "completed" ? "#bbf7d0" : item.status === "failed" ? "#fecaca" : item.status === "running" ? "#f5e07a" : "#e5e7eb"}` }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
    </NavLayout>
  );
}

export default function CrawlPage() {
  return <Suspense fallback={<div style={{display:"flex",justifyContent:"center",padding:48}}><div style={{width:24,height:24,border:"2px solid #e5e7eb",borderTopColor:"#f5c518",borderRadius:"50%",animation:"spin 0.7s linear infinite"}} /></div>}><CrawlPageInner /></Suspense>;
}
