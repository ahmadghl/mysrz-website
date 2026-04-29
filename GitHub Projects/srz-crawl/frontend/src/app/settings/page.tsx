"use client";
import { useEffect, useState } from "react";
import NavLayout from "@/components/NavLayout";
import { api } from "@/lib/api";
import { Key, Database, FileText, CreditCard, Eye, EyeOff, Check, X, Loader2, AlertTriangle, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";

const TABS = [
  { id: "openai", label: "OpenAI", icon: Key },
  { id: "database", label: "Database", icon: Database },
  { id: "prompt", label: "Prompt", icon: FileText },
  { id: "subscription", label: "Subscription", icon: CreditCard },
];
const MODELS = [
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

const c = {
  card: { background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, padding: "16px 20px" } as React.CSSProperties,
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.4px" },
  input: { width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 14px", fontSize: 13, color: "#111", outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" as const },
  btn: { background: "#f5c518", color: "#7a5c00", fontWeight: 700, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } as React.CSSProperties,
  btnGhost: { background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } as React.CSSProperties,
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13 },
  success: { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", padding: "10px 14px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 6 },
  h2: { fontSize: 15, fontWeight: 700, color: "#111", margin: "0 0 4px" },
  sub: { fontSize: 13, color: "#9ca3af", margin: 0 },
};

function OpenAITab() {
  const [config, setConfig] = useState<any>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState("gpt-4-turbo");
  const [temperature, setTemperature] = useState(0.7);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.settings.openai.get().then((data) => { setConfig(data); setModel(data.model || "gpt-4-turbo"); setTemperature(data.temperature ?? 0.7); });
  }, []);

  const save = async () => {
    if (!apiKey && !config?.has_key) { setError("Please enter your OpenAI API key"); return; }
    setSaving(true); setError(""); setSuccess(false);
    try {
      await api.settings.openai.save({ api_key: apiKey || "__keep__", model, temperature });
      setSuccess(true); setApiKey("");
      const refreshed = await api.settings.openai.get(); setConfig(refreshed);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 16 }}>
      <div><p style={c.h2}>OpenAI Configuration</p><p style={c.sub}>Your API key is encrypted before storage</p></div>
      {error && <div style={c.error}>{error}</div>}
      {success && <div style={c.success}><Check size={14} />Saved successfully</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={c.label}>API Key</label>
          {config?.has_key && <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>Current: <code style={{ fontFamily: "monospace" }}>{config.masked_key}</code></p>}
          <div style={{ position: "relative" }}>
            <input type={showKey ? "text" : "password"} value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              placeholder={config?.has_key ? "Enter new key to replace" : "sk-..."} style={{ ...c.input, paddingRight: 36 }} />
            <button type="button" onClick={() => setShowKey(!showKey)}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div>
          <label style={c.label}>Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)} style={{ ...c.input }}>
            {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label style={c.label}>Temperature: <span style={{ color: "#111", fontWeight: 700 }}>{temperature}</span></label>
          <input type="range" min="0" max="1" step="0.1" value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#f5c518" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
            <span>Precise</span><span>Creative</span>
          </div>
        </div>
      </div>
      <button onClick={save} disabled={saving} style={{ ...c.btn, opacity: saving ? 0.6 : 1 }}>
        {saving ? <Loader2 size={15} /> : <Check size={15} />}{saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}

function DatabaseTab() {
  const [config, setConfig] = useState<any>(null);
  const [useCustom, setUseCustom] = useState(false);
  const [form, setForm] = useState({ supabase_url: "", anon_key: "", service_role_key: "" });
  const [showKeys, setShowKeys] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [migrating, setMigrating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.settings.supabase.get().then((data) => { setConfig(data); setUseCustom(data.is_custom); }).catch(() => {});
  }, []);

  const testConnection = async () => {
    setTesting(true); setTestResult(null); setError("");
    try { const r = await api.settings.supabase.test(form); setTestResult(r); }
    catch (e: any) { setError(e.message); } finally { setTesting(false); }
  };

  const saveConfig = async () => {
    setSaving(true); setError(""); setSuccess("");
    try { await api.settings.supabase.save(form); setSuccess("Custom Supabase configured successfully"); }
    catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 16 }}>
      <div><p style={c.h2}>Database Configuration</p><p style={c.sub}>Use your own Supabase for complete data privacy</p></div>
      {error && <div style={c.error}>{error}</div>}
      {success && <div style={c.success}><Check size={14} />{success}</div>}
      <div style={{ ...c.card, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>Use Custom Supabase</p>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{useCustom ? config?.masked_url || "Custom instance active" : "Using SRZ Cloud Database"}</p>
        </div>
        <button onClick={() => setUseCustom(!useCustom)} style={{ background: "none", border: "none", cursor: "pointer", color: useCustom ? "#f5c518" : "#d1d5db" }}>
          {useCustom ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
        </button>
      </div>
      {!useCustom && <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#2563eb" }}>Using SRZ Cloud Database — your data is secure and managed</div>}
      {useCustom && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {["supabase_url", "anon_key", "service_role_key"].map((field) => (
            <div key={field}>
              <label style={c.label}>{field.replace(/_/g, " ")}</label>
              <input type={showKeys || field === "supabase_url" ? "text" : "password"}
                value={(form as any)[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={field === "supabase_url" ? "https://your-project.supabase.co" : ""}
                style={c.input} />
            </div>
          ))}
          {testResult && (
            <div style={testResult.success ? c.success : c.error}>
              {testResult.success ? <Check size={14} /> : <X size={14} />}{testResult.message}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={testConnection} disabled={testing} style={c.btnGhost}>
              {testing ? <Loader2 size={14} /> : <RefreshCw size={14} />}Test Connection
            </button>
            <button onClick={saveConfig} disabled={saving} style={c.btn}>
              {saving ? <Loader2 size={14} /> : <Check size={14} />}Save & Activate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PromptTab() {
  const [prompt, setPrompt] = useState("");
  const [defaultPrompt, setDefaultPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { api.settings.prompt.get().then((data) => { setPrompt(data.system_prompt); setDefaultPrompt(data.default_prompt); }); }, []);

  const save = async () => { setSaving(true); setSuccess(false); try { await api.settings.prompt.save(prompt); setSuccess(true); } finally { setSaving(false); } };

  return (
    <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 16 }}>
      <div><p style={c.h2}>System Prompt</p><p style={c.sub}>Customize how the AI responds in chat</p></div>
      {success && <div style={c.success}><Check size={14} />Saved</div>}
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={10}
        placeholder="Enter your system prompt…"
        style={{ ...c.input, fontFamily: "monospace", resize: "none", lineHeight: 1.6 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setPrompt(defaultPrompt)} style={c.btnGhost}>Reset to Default</button>
        <button onClick={save} disabled={saving} style={c.btn}>
          {saving ? <Loader2 size={14} /> : <Check size={14} />}{saving ? "Saving…" : "Save Prompt"}
        </button>
      </div>
    </div>
  );
}

function SubscriptionTab() {
  const [sub, setSub] = useState<any>(null);
  useEffect(() => { api.settings.subscription().then(setSub); }, []);
  if (!sub) return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /></div>;
  const pagesPercent = sub.pages_limit > 0 ? Math.min((sub.pages_used / sub.pages_limit) * 100, 100) : 0;
  const storagePercent = sub.storage_limit_mb > 0 ? Math.min((sub.storage_used_mb / sub.storage_limit_mb) * 100, 100) : 0;
  return (
    <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 16 }}>
      <div><p style={c.h2}>Subscription</p><p style={c.sub}>Your current plan and usage</p></div>
      <div style={c.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Current Plan</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#b8860b", margin: "2px 0 0", textTransform: "capitalize" }}>{sub.tier}</p>
          </div>
          {sub.tier !== "enterprise" && <button style={c.btn}>Upgrade</button>}
        </div>
        {[
          { label: "Pages this month", used: sub.pages_used, limit: sub.pages_limit, pct: pagesPercent },
          { label: "Storage", used: `${sub.storage_used_mb.toFixed(1)} MB`, limit: sub.storage_limit_mb === -1 ? "∞" : `${sub.storage_limit_mb} MB`, pct: storagePercent },
        ].map((item) => (
          <div key={item.label} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "#6b7280" }}>{item.label}</span>
              <span style={{ color: "#111", fontWeight: 600 }}>{item.used} / {item.limit === -1 ? "∞" : item.limit}</span>
            </div>
            <div style={{ height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${item.pct}%`, background: "#f5c518", borderRadius: 99 }} />
            </div>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px" }}>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Team Members</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "4px 0 0" }}>{sub.team_members_count} / {sub.team_members_limit === -1 ? "∞" : sub.team_members_limit}</p>
          </div>
          <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px" }}>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Crawls this month</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "4px 0 0" }}>{sub.crawls_this_month}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("openai");
  return (
    <NavLayout>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, fontFamily: "Inter,sans-serif" }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>Configure your account preferences</p>
        </div>
        <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #ebebeb", borderRadius: 10, padding: 4 }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.15s",
                background: activeTab === id ? "#f5c518" : "transparent",
                color: activeTab === id ? "#7a5c00" : "#6b7280" }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
        <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, padding: "24px" }}>
          {activeTab === "openai" && <OpenAITab />}
          {activeTab === "database" && <DatabaseTab />}
          {activeTab === "prompt" && <PromptTab />}
          {activeTab === "subscription" && <SubscriptionTab />}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </NavLayout>
  );
}
