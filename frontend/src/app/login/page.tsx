"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Globe, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Please confirm your email address before signing in. Check your inbox.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  const inp = { width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 14px", fontSize: 13, color: "#111", outline: "none", boxSizing: "border-box" as const, fontFamily: "Inter,sans-serif" };
  const lbl = { display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.4px" };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Inter,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f5c518", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={17} color="#7a5c00" />
            </div>
            <span style={{ fontSize: 21, fontWeight: 700, color: "#111", letterSpacing: "-0.5px" }}>SRZ Crawl</span>
          </div>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Web Intelligence Platform</p>
        </div>

        <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 14, padding: 28 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 20px" }}>Sign in to your account</h1>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={lbl}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="you@example.com"
                style={{ ...inp, borderColor: error ? "#fca5a5" : "#e5e7eb" }} />
            </div>
            <div>
              <label style={lbl}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                  style={{ ...inp, paddingRight: 36, borderColor: error ? "#fca5a5" : "#e5e7eb" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", background: "#f5c518", color: "#7a5c00", fontWeight: 700, border: "none", borderRadius: 8, padding: "11px 16px", fontSize: 14, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <span style={{ width: 16, height: 16, border: "2px solid #d4a017", borderTopColor: "#7a5c00", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                : <ArrowRight size={15} />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", margin: "20px 0 0" }}>
            Don't have an account?{" "}
            <a href="/signup" style={{ color: "#b8860b", fontWeight: 600, textDecoration: "none" }}>Sign up</a>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
