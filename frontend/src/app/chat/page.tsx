"use client";
import { Suspense } from "react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import NavLayout from "@/components/NavLayout";
import { api } from "@/lib/api";
import type { ChatSession, ChatMessage, Domain } from "@/types";
import { MessageSquare, Plus, Send, Paperclip, Globe, Trash2, ExternalLink, X, Loader2 } from "lucide-react";

const s = {
  card: { background: "#fff", border: "1px solid #ebebeb", borderRadius: 12 } as React.CSSProperties,
};

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "10px 14px" }}>
      {[0,1,2].map((i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#d4a017", display: "inline-block", animation: `typingBounce 1.4s ${i*0.2}s infinite ease-in-out` }} />
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 14 }}>
      <div style={{ maxWidth: "80%" }}>
        <div style={{
          padding: "10px 14px", borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          background: isUser ? "#f5c518" : "#f9fafb",
          border: isUser ? "none" : "1px solid #ebebeb",
          fontSize: 13, lineHeight: 1.6, color: isUser ? "#7a5c00" : "#111",
        }}>
          {message.content}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
            {message.sources.map((src: any, i: number) => (
              <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#9ca3af", textDecoration: "none" }}>
                <ExternalLink size={10} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>{src.title || src.url}</span>
                <span style={{ color: "#d1d5db" }}>({Math.round(src.similarity * 100)}%)</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatInner() {
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("session");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ file_id: string; filename: string }>>([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([api.chat.sessions.list(), api.domains.list()])
      .then(([s, d]) => {
        setSessions(s); setDomains(d);
        if (d.length > 0) setSelectedDomain(d[0].id);
        if (sessionIdParam) { const found = s.find((sess: ChatSession) => sess.id === sessionIdParam); if (found) selectSession(found); }
      }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const selectSession = async (session: ChatSession) => {
    setActiveSession(session); setMessages([]);
    try { const msgs = await api.chat.messages.list(session.id); setMessages(msgs); } catch {}
  };

  const createSession = async () => {
    if (!selectedDomain) { setError("Select a domain first"); return; }
    try { const session = await api.chat.sessions.create(selectedDomain); setSessions((prev) => [session, ...prev]); selectSession(session); }
    catch (e: any) { setError(e.message); }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await api.chat.sessions.delete(id); setSessions((prev) => prev.filter((s) => s.id !== id)); if (activeSession?.id === id) { setActiveSession(null); setMessages([]); } } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSession || sending) return;
    const content = input.trim(); setInput(""); setSending(true); setError("");
    const tempMsg: ChatMessage = { id: "temp-" + Date.now(), role: "user", content, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);
    try {
      const response = await api.chat.messages.send(activeSession.id, content, uploadedFiles.map((f) => f.file_id));
      setMessages((prev) => [...prev.filter((m) => m.id !== tempMsg.id), tempMsg, response]);
      setUploadedFiles([]);
    } catch (e: any) { setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id)); setError(e.message); }
    finally { setSending(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const result = await api.chat.upload(file); setUploadedFiles((prev) => [...prev, { file_id: result.file_id, filename: file.name }]); }
    catch (e: any) { setError(e.message); } finally { setUploading(false); }
  };

  if (loading) return <NavLayout><div style={{ display: "flex", justifyContent: "center", padding: 80 }}><div style={{ width: 24, height: 24, border: "2px solid #e5e7eb", borderTopColor: "#f5c518", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /></div></NavLayout>;

  return (
    <NavLayout>
      <div style={{ display: "flex", height: "calc(100vh - 96px)", gap: 14, fontFamily: "Inter,sans-serif" }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div style={{ width: 260, flexShrink: 0, ...s.card, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #f0f0f0" }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Domain</label>
              <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)}
                style={{ width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12, color: "#111", outline: "none" }}>
                {domains.map((d) => <option key={d.id} value={d.id}>{d.url.replace(/^https?:\/\//, "").slice(0, 35)}</option>)}
              </select>
              <button onClick={createSession}
                style={{ width: "100%", marginTop: 8, background: "#f5c518", color: "#7a5c00", fontWeight: 700, border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Plus size={13} />New Chat
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {sessions.map((session) => (
                <div key={session.id} onClick={() => selectSession(session)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                    background: activeSession?.id === session.id ? "#fef9e3" : "transparent",
                    border: activeSession?.id === session.id ? "1px solid #f5e07a" : "1px solid transparent" }}>
                  <MessageSquare size={13} style={{ color: activeSession?.id === session.id ? "#b8860b" : "#9ca3af", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: activeSession?.id === session.id ? "#b8860b" : "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.name}</span>
                  <button onClick={(e) => deleteSession(session.id, e)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#e5e7eb", padding: 2, opacity: 0, flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}>
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              {sessions.length === 0 && <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 12, padding: "20px 0" }}>No chats yet</p>}
            </div>
          </div>
        )}

        {/* Main chat */}
        <div style={{ flex: 1, ...s.card, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              <MessageSquare size={17} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              {activeSession ? (
                <>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeSession.name}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: "1px 0 0", display: "flex", alignItems: "center", gap: 4 }}><Globe size={10} />{activeSession.domain_url}</p>
                </>
              ) : (
                <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Select or create a chat</p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {!activeSession ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <div style={{ textAlign: "center" }}>
                  <MessageSquare size={40} style={{ color: "#e5e7eb", margin: "0 auto 10px" }} />
                  <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>Start a new chat to query your crawled data</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fef9e3", border: "1px solid #f5e07a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <MessageSquare size={22} color="#b8860b" />
                  </div>
                  <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>Ask anything about <strong style={{ color: "#111" }}>{activeSession.domain_url}</strong></p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
                {sending && (
                  <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
                    <div style={{ background: "#f9fafb", border: "1px solid #ebebeb", borderRadius: "14px 14px 14px 4px" }}>
                      <TypingIndicator />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ margin: "0 14px 8px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "8px 12px", borderRadius: 8, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>{error}</span>
              <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}><X size={12} /></button>
            </div>
          )}

          {/* Uploaded files */}
          {uploadedFiles.length > 0 && (
            <div style={{ padding: "0 14px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {uploadedFiles.map((f) => (
                <div key={f.file_id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#6b7280" }}>
                  <Paperclip size={10} />{f.filename}
                  <button onClick={() => setUploadedFiles((prev) => prev.filter((x) => x.file_id !== f.file_id))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}><X size={10} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "flex-end", gap: 8 }}>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading || !activeSession}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 6, opacity: (!activeSession || uploading) ? 0.4 : 1 }}>
              {uploading ? <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> : <Paperclip size={17} />}
            </button>
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              disabled={!activeSession || sending}
              placeholder={activeSession ? "Ask a question… (Enter to send)" : "Select a domain and create a chat"}
              rows={1} style={{ flex: 1, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#111", outline: "none", resize: "none", fontFamily: "Inter,sans-serif", opacity: (!activeSession || sending) ? 0.5 : 1 }} />
            <button onClick={sendMessage} disabled={!input.trim() || !activeSession || sending}
              style={{ width: 36, height: 36, borderRadius: 10, background: "#f5c518", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: (!input.trim() || !activeSession || sending) ? 0.4 : 1 }}>
              {sending ? <Loader2 size={15} color="#7a5c00" style={{ animation: "spin 1s linear infinite" }} /> : <Send size={15} color="#7a5c00" />}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes typingBounce{0%,80%,100%{transform:scale(.8);opacity:.5}40%{transform:scale(1.2);opacity:1}}`}</style>
    </NavLayout>
  );
}

export default function ChatPage() {
  return <Suspense fallback={<div style={{display:"flex",justifyContent:"center",padding:80}}><div style={{width:24,height:24,border:"2px solid #e5e7eb",borderTopColor:"#f5c518",borderRadius:"50%",animation:"spin 0.7s linear infinite"}} /></div>}><ChatInner /></Suspense>;
}
