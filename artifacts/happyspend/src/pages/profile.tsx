import { useGetMe, useLogout, useUpdateProfile } from "@workspace/api-client-react";
import { LogOut, Mail, Calendar, Pencil, Check, X, Bell, BellOff, Star } from "lucide-react";
import { format } from "date-fns";
import { useLocation, Link } from "wouter";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

const DM = "'DM Sans', sans-serif";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr;
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

type NotifSettings = {
  notificationsEnabled: boolean;
  reminderTime1: string;
  reminderTime2: string;
  vapidPublicKey: string;
};

export default function Profile() {
  const { data: user } = useGetMe();
  const logout = useLogout();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState("");

  const [notifSettings, setNotifSettings] = useState<NotifSettings | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [reminderTime1, setReminderTime1] = useState("12:30");
  const [reminderTime2, setReminderTime2] = useState("19:00");
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (!("Notification" in window)) {
      setNotifPermission("unsupported");
    } else {
      setNotifPermission(Notification.permission);
    }
    fetch("/api/notifications/settings")
      .then((r) => r.json())
      .then((data: NotifSettings) => {
        setNotifSettings(data);
        setNotifEnabled(data.notificationsEnabled);
        setReminderTime1(data.reminderTime1);
        setReminderTime2(data.reminderTime2);
      })
      .catch(() => {});
  }, []);

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

  const subscribePush = async (vapidPublicKey: string): Promise<boolean> => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const rawKeys = sub.getKey ? {
        p256dh: arrayBufferToBase64(sub.getKey("p256dh")!),
        auth: arrayBufferToBase64(sub.getKey("auth")!),
      } : undefined;
      if (!rawKeys) return false;
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint, keys: rawKeys }),
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleToggleNotifications = async (enable: boolean) => {
    if (enable) {
      if (notifPermission === "unsupported") return;
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission !== "granted") return;
      const pubKey = notifSettings?.vapidPublicKey ?? "";
      if (pubKey) await subscribePush(pubKey);
    }
    setNotifEnabled(enable);
    setNotifSaving(true);
    try {
      await fetch("/api/notifications/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationsEnabled: enable }),
      });
    } finally {
      setNotifSaving(false);
    }
  };

  const saveReminderTimes = async () => {
    setNotifSaving(true);
    try {
      await fetch("/api/notifications/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderTime1, reminderTime2 }),
      });
    } finally {
      setNotifSaving(false);
    }
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
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 58, height: 58, borderRadius: "50%", background: "#EEF4F0",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 20, color: "#7C9E8A" }}>
              {initials}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: DM, fontWeight: 700, fontSize: 20, color: "#1a1a1a", marginBottom: 2 }}>
              {user.name}
            </h2>
            <p style={{ fontSize: 14, color: "#777", marginBottom: 8 }}>{user.email}</p>
            {(user as any).isPremium ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EEF4F0", borderRadius: 100, padding: "4px 10px" }}>
                <Star style={{ color: "#7C9E8A", width: 12, height: 12 }} fill="#7C9E8A" />
                <span style={{ fontFamily: DM, fontSize: 12, fontWeight: 700, color: "#7C9E8A" }}>Premium</span>
              </div>
            ) : (
              <Link href="/upgrade" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EEF4F0", borderRadius: 100, padding: "4px 12px", textDecoration: "none" }}>
                <span style={{ fontFamily: DM, fontSize: 12, fontWeight: 600, color: "#7C9E8A" }}>Free plan</span>
                <span style={{ color: "#9C9690", fontSize: 12 }}>·</span>
                <span style={{ fontFamily: DM, fontSize: 12, fontWeight: 700, color: "#7C9E8A" }}>Upgrade</span>
              </Link>
            )}
          </div>
        </div>

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

      {/* Monthly income */}
      <div
        style={{
          background: "#FFFFFF", borderRadius: 18, boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
          padding: "20px", marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          Monthly Income
        </p>

        {editingIncome ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 18, color: "#7C9E8A" }}>R</span>
            <input
              autoFocus type="number" min={0} placeholder="0"
              value={incomeInput} onChange={(e) => setIncomeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveIncome(); if (e.key === "Escape") cancelEdit(); }}
              style={{
                flex: 1, border: "none", borderBottom: "2px solid #7C9E8A", outline: "none",
                background: "transparent", fontFamily: DM, fontSize: 22, fontWeight: 700, color: "#1a1a1a",
                paddingBottom: 2,
              }}
            />
            <button onClick={saveIncome} disabled={updateProfile.isPending} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <Check className="w-5 h-5" style={{ color: "#7C9E8A" }} />
            </button>
            <button onClick={cancelEdit} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <X className="w-5 h-5" style={{ color: "#aaa" }} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 22, color: "#1a1a1a" }}>
              {user.monthlyIncome != null
                ? `R${Intl.NumberFormat("en-ZA").format(user.monthlyIncome)}`
                : <span style={{ color: "#bbb", fontWeight: 500, fontSize: 15 }}>Not set</span>}
            </span>
            <button onClick={startEditIncome} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
              <Pencil className="w-4 h-4" style={{ color: "#7C9E8A" }} />
            </button>
          </div>
        )}
      </div>

      {/* Reminders */}
      <div
        style={{
          background: "#FFFFFF", borderRadius: 18, boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
          padding: "20px", marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          Reminders
        </p>

        {notifPermission === "unsupported" ? (
          <p style={{ fontSize: 13, color: "#999", lineHeight: 1.6 }}>
            Push notifications are not supported in this browser. Try Chrome or Edge on Android.
          </p>
        ) : notifPermission === "denied" ? (
          <p style={{ fontSize: 13, color: "#999", lineHeight: 1.6 }}>
            Notifications are blocked. Enable them in your browser settings to receive reminders.
          </p>
        ) : (
          <>
            {/* Enable toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: notifEnabled ? "#EEF4F0" : "#F5F3EF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {notifEnabled
                    ? <Bell className="w-4 h-4" style={{ color: "#7C9E8A" }} />
                    : <BellOff className="w-4 h-4" style={{ color: "#aaa" }} />}
                </div>
                <div>
                  <p style={{ fontFamily: DM, fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>Daily reminders</p>
                  <p style={{ fontSize: 12, color: "#999", marginTop: 1 }}>Streak-aware, never guilt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotifications(!notifEnabled)}
                disabled={notifSaving}
                style={{
                  width: 48, height: 28, borderRadius: 100,
                  background: notifEnabled ? "#7C9E8A" : "#DDD8CE",
                  border: "none", cursor: "pointer", position: "relative",
                  transition: "background 0.2s", flexShrink: 0,
                  opacity: notifSaving ? 0.6 : 1,
                }}
                aria-label="Toggle reminders"
              >
                <span style={{
                  position: "absolute", top: 4, left: notifEnabled ? 23 : 4,
                  width: 20, height: 20, borderRadius: "50%", background: "#FFFFFF",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s",
                }} />
              </button>
            </div>

            {/* Time pickers — only show when enabled */}
            {notifEnabled && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                  <div>
                    <label style={{ fontFamily: DM, fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>
                      Midday reminder
                    </label>
                    <input
                      type="time"
                      value={reminderTime1}
                      onChange={(e) => setReminderTime1(e.target.value)}
                      style={{
                        width: "100%", padding: "12px 14px", background: "#F5F3EF",
                        border: "none", borderRadius: 12, fontFamily: DM, fontSize: 15,
                        color: "#1a1a1a", outline: "none", boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: DM, fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>
                      Evening reminder
                    </label>
                    <input
                      type="time"
                      value={reminderTime2}
                      onChange={(e) => setReminderTime2(e.target.value)}
                      style={{
                        width: "100%", padding: "12px 14px", background: "#F5F3EF",
                        border: "none", borderRadius: 12, fontFamily: DM, fontSize: 15,
                        color: "#1a1a1a", outline: "none", boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={saveReminderTimes}
                  disabled={notifSaving}
                  style={{
                    width: "100%", background: "#7C9E8A", color: "#fff", borderRadius: 100,
                    padding: "14px 0", fontFamily: DM, fontSize: 15, fontWeight: 600,
                    border: "none", cursor: "pointer", opacity: notifSaving ? 0.6 : 1,
                  }}
                >
                  {notifSaving ? "Saving…" : "Save times"}
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Persona section */}
      {user.personaId && (
        <div
          style={{
            background: "#FFFFFF", borderRadius: 18, boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
            padding: "20px", marginBottom: 16,
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
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, padding: "15px 0", background: "transparent", border: "1.5px solid #DDD8CE",
          borderRadius: 14, fontFamily: DM, fontSize: 14, fontWeight: 600, color: "#888",
          cursor: "pointer", marginTop: 8,
        }}
      >
        <LogOut className="w-4 h-4" />
        {logout.isPending ? "Logging out…" : "Log out"}
      </button>
    </div>
  );
}
