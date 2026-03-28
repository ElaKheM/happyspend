import { useGetMe, useLogout } from "@workspace/api-client-react";
import { LogOut, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

const DM = "'DM Sans', sans-serif";

export default function Profile() {
  const { data: user } = useGetMe();
  const logout = useLogout();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        localStorage.removeItem("happyspend_token");
        setLocation("/auth");
      },
    });
  };

  if (!user) return null;

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div style={{ background: "#FAF9F6", minHeight: "100vh", fontFamily: DM, padding: "0 20px 40px" }}>

      {/* Header */}
      <header style={{ paddingTop: 48, marginBottom: 28 }}>
        <h1 style={{ fontFamily: DM, fontWeight: 700, fontSize: 28, color: "#1a1a1a" }}>Profile</h1>
      </header>

      {/* Profile card */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 18,
          borderLeft: "4px solid #7C9E8A",
          boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
          padding: "24px 20px",
          marginBottom: 16,
        }}
      >
        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "#EEF4F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 20, color: "#7C9E8A" }}>
              {initials}
            </span>
          </div>
          <div>
            <h2 style={{ fontFamily: DM, fontWeight: 700, fontSize: 20, color: "#1a1a1a", marginBottom: 2 }}>
              {user.name}
            </h2>
            <p style={{ fontSize: 14, color: "#777" }}>{user.email}</p>
          </div>
        </div>

        {/* Details */}
        <div style={{ borderTop: "1px solid #EDE9E0", paddingTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EEF4F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mail className="w-4 h-4" style={{ color: "#7C9E8A" }} />
            </div>
            <span style={{ fontSize: 14, color: "#1a1a1a", fontWeight: 500 }}>{user.email}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EEF4F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar className="w-4 h-4" style={{ color: "#7C9E8A" }} />
            </div>
            <span style={{ fontSize: 14, color: "#1a1a1a", fontWeight: 500 }}>
              Joined {format(new Date(user.createdAt), "MMMM yyyy")}
            </span>
          </div>
        </div>
      </div>

      {/* Persona section (if available) */}
      {user.personaId && (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 18,
            boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
            padding: "20px",
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Your Path
          </p>
          <p style={{ fontFamily: DM, fontWeight: 600, fontSize: 16, color: "#7C9E8A" }}>
            Building better habits, one entry at a time.
          </p>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={logout.isPending}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "15px 0",
          background: "transparent",
          border: "1.5px solid #DDD8CE",
          borderRadius: 14,
          fontFamily: DM,
          fontSize: 14,
          fontWeight: 600,
          color: "#888",
          cursor: "pointer",
          marginTop: 8,
        }}
      >
        <LogOut className="w-4 h-4" />
        {logout.isPending ? "Logging out…" : "Log out"}
      </button>
    </div>
  );
}
