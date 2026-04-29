"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Globe, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) { setError("You must agree to the Terms of Service and Privacy Policy to continue."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true); setError("");

    // Check if email already exists by attempting signup
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { first_name: form.firstName, last_name: form.lastName, marketing_emails: marketing },
      },
    });

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already been registered") || error.message.includes("User already registered")) {
        setError("This email address is already registered. Please sign in instead.");
      } else if (error.message.includes("Password should be")) {
        setError("Password must be at least 8 characters and include letters and numbers.");
      } else if (error.message.includes("valid email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else if (data?.user?.identities?.length === 0) {
      // Supabase returns a user but with empty identities if email already exists
      setError("This email address is already registered. Please sign in instead.");
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  const inp = { width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 14px", fontSize: 13, color: "#111", outline: "none", boxSizing: "border-box" as const, fontFamily: "Inter,sans-serif" };
  const lbl = { display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.4px" };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Inter,sans-serif" }}>
        <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 14, padding: 40, maxWidth: 400, width: "100%", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle size={26} color="#16a34a" />
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>Check your email</h2>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 6px" }}>
            We sent a confirmation link to <strong style={{ color: "#111" }}>{form.email}</strong>.
          </p>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Click the link to activate your account and get started.</p>
          <a href="/login" style={{ display: "inline-block", marginTop: 24, fontSize: 13, color: "#b8860b", fontWeight: 600, textDecoration: "none" }}>Back to login →</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Inter,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f5c518", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={17} color="#7a5c00" />
            </div>
            <span style={{ fontSize: 21, fontWeight: 700, color: "#111", letterSpacing: "-0.5px" }}>SRZ Crawl</span>
          </div>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Create your free account</p>
        </div>

        <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 14, padding: 28 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 20px" }}>Get started</h1>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ flexShrink: 0 }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={lbl}>First Name</label>
                <input value={form.firstName} onChange={(e) => update("firstName", e.target.value)}
                  required placeholder="Ahmad" style={inp} />
              </div>
              <div>
                <label style={lbl}>Last Name</label>
                <input value={form.lastName} onChange={(e) => update("lastName", e.target.value)}
                  required placeholder="Khan" style={inp} />
              </div>
            </div>

            <div>
              <label style={lbl}>Email Address</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                required placeholder="you@example.com" style={inp} />
            </div>

            <div>
              <label style={lbl}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required minLength={8} placeholder="Min. 8 characters"
                  style={{ ...inp, paddingRight: 36 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "5px 0 0" }}>Must be at least 8 characters</p>
            </div>

            <div style={{ borderTop: "1px solid #f0f0f0", margin: "2px 0" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "#f5c518", width: 15, height: 15, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <a href="#" style={{ color: "#b8860b", fontWeight: 600, textDecoration: "none" }}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" style={{ color: "#b8860b", fontWeight: 600, textDecoration: "none" }}>Privacy Policy</a>
                  . <span style={{ color: "#ef4444" }}>*</span>
                </span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "#f5c518", width: 15, height: 15, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>
                  I'd like to receive product updates and promotional emails. You can unsubscribe at any time.
                </span>
              </label>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", background: "#f5c518", color: "#7a5c00", fontWeight: 700, border: "none", borderRadius: 8, padding: "11px 16px", fontSize: 14, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading && <span style={{ width: 16, height: 16, border: "2px solid #d4a017", borderTopColor: "#7a5c00", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", margin: "20px 0 0" }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "#b8860b", fontWeight: 600, textDecoration: "none" }}>Sign in</a>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#d1d5db", marginTop: 16 }}>
          Protected by industry-standard encryption. We never share your data.
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
