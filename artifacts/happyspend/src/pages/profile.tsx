import { useGetMe, useLogout, useUpdateProfile } from "@workspace/api-client-react";
import { LogOut, Mail, Calendar, Pencil, Check, X } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

const DM = "'DM Sans', sans-serif";

export default function Profile() {
  const { data: user } = useGetMe();
  const logout = useLogout();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState("");

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        localStorage.removeItem("happyspend_token");
        setLocation("/auth");
      },
    });
  };

  const startEditIncome = () => {
    setIncomeInput(user?.monthlyIncome != null ? String(user.monthlyIncome) : "");
    setEditingIncome(true);
  };

  const saveIncome = () => {
    const n = parseFloat(incomeInput);
    const income = !isNaN(n) && n > 0 ? n : null;
    updateProfile.mutate(
      { monthlyIncome: income },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setEditingIncome(false);
        },
      }
    );
  };

  const cancelEdit = () => {
    setEditingIncome(false);
    setIncomeInput("");
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

      {/* Monthly income card */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 18,
          boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
          padding: "20px",
          marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          Monthly Income
        </p>

        {editingIncome ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 18, color: "#7C9E8A" }}>R</span>
            <input
              autoFocus
              type="number"
              min={0}
              placeholder="0"
              value={incomeInput}
              onChange={(e) => setIncomeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveIncome();
                if (e.key === "Escape") cancelEdit();
              }}
              style={{
                flex: 1,
                border: "none",
                borderBottom: "2px solid #7C9E8A",
                outline: "none",
                background: "transparent",
                fontFamily: DM,
                fontSize: 22,
                fontWeight: 700,
                color: "#1a1a1a",
                fontVariantNumeric: "tabular-nums slashed-zero",
                paddingBottom: 2,
              }}
            />
            <button
              onClick={saveIncome}
              disabled={updateProfile.isPending}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              <Check className="w-5 h-5" style={{ color: "#7C9E8A" }} />
            </button>
            <button
              onClick={cancelEdit}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              <X className="w-5 h-5" style={{ color: "#aaa" }} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 22, color: "#1a1a1a" }}>
              {user.monthlyIncome != null
                ? `R ${Intl.NumberFormat("en-ZA").format(user.monthlyIncome)}`
                : <span style={{ color: "#bbb", fontWeight: 500, fontSize: 15 }}>Not set</span>}
            </span>
            <button
              onClick={startEditIncome}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}
            >
              <Pencil className="w-4 h-4" style={{ color: "#7C9E8A" }} />
            </button>
          </div>
        )}
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
