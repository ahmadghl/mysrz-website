"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Globe, MessageSquare, Clock, Settings, Users, LogOut, Activity, ChevronRight, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Globe },
  { href: "/crawl", label: "Crawl Monitor", icon: Activity },
  { href: "/schedules", label: "Schedules", icon: Clock },
  { href: "/chat", label: "Chat / RAG", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/team", label: "Team", icon: Users },
];

export default function NavLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <div style={{ width: 24, height: 24, border: "2px solid #e5e7eb", borderTopColor: "#f5c518", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }

  const initials = user.email?.charAt(0).toUpperCase() || "U";
  const showSidebar = isDesktop || sidebarOpen;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5", fontFamily: "Inter, sans-serif" }}>

      {sidebarOpen && !isDesktop && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.2)" }} />
      )}

      <aside style={{
        width: 224, flexShrink: 0, background: "#ffffff", borderRight: "1px solid #ebebeb",
        display: "flex", flexDirection: "column",
        position: isDesktop ? "sticky" : "fixed",
        top: 0, left: 0, height: "100vh", zIndex: 50,
        transform: showSidebar ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
      }}>
        <div style={{ padding: "18px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f5c518", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Globe size={16} color="#7a5c00" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111", letterSpacing: "-0.3px" }}>SRZ Crawl</span>
          {!isDesktop && (
            <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: "auto", color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>
              <X size={18} />
            </button>
          )}
        </div>

        <nav style={{ flex: 1, padding: "10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
          <p style={{ fontSize: 10.5, fontWeight: 600, color: "#b0b0b0", textTransform: "uppercase", letterSpacing: "0.7px", padding: "12px 8px 4px", margin: 0 }}>Main</p>
          {NAV_ITEMS.slice(0, 3).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "8px 10px",
                  borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none",
                  background: active ? "#fef9e3" : "transparent",
                  color: active ? "#b8860b" : "#6b7280",
                }}>
                <Icon size={15} style={{ flexShrink: 0 }} />
                {label}
                {active && <ChevronRight size={13} style={{ marginLeft: "auto", color: "#d4a017" }} />}
              </Link>
            );
          })}
          <p style={{ fontSize: 10.5, fontWeight: 600, color: "#b0b0b0", textTransform: "uppercase", letterSpacing: "0.7px", padding: "16px 8px 4px", margin: 0 }}>Tools</p>
          {NAV_ITEMS.slice(3).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "8px 10px",
                  borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none",
                  background: active ? "#fef9e3" : "transparent",
                  color: active ? "#b8860b" : "#6b7280",
                }}>
                <Icon size={15} style={{ flexShrink: 0 }} />
                {label}
                {active && <ChevronRight size={13} style={{ marginLeft: "auto", color: "#d4a017" }} />}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "10px", borderTop: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 8, background: "#fafafa", border: "1px solid #f0f0f0" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f5c518", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#7a5c00" }}>{initials}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{user.email}</p>
            </div>
            <button onClick={signOut} title="Sign out" style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 2 }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {!isDesktop && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#ffffff", borderBottom: "1px solid #ebebeb" }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
              <Menu size={20} />
            </button>
            <span style={{ fontWeight: 700, color: "#111", fontSize: 15 }}>SRZ Crawl</span>
          </div>
        )}
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {children}
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
