import { useLocation } from "wouter";
import { Check, ArrowLeft, Star } from "lucide-react";

const DM = "'DM Sans', sans-serif";
const SAGE = "#7C9E8A";

const FEATURES = [
  "Full Spend DNA — all 5 insights",
  "Complete spending history",
  "Monthly pattern reports",
  "Personalised budget suggestions",
  "Recurring expense auto-fill",
];

export default function Upgrade() {
  const [, setLocation] = useLocation();

  const handleUnlock = () => {
    setLocation("/profile");
  };

  return (
    <div
      style={{
        background: "#FAF9F6",
        minHeight: "100vh",
        fontFamily: DM,
        padding: "0 20px 48px",
        maxWidth: 448,
        margin: "0 auto",
      }}
    >
      <header style={{ paddingTop: 52, marginBottom: 36 }}>
        <button
          onClick={() => history.back()}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#888",
            fontFamily: DM,
            fontSize: 14,
            cursor: "pointer",
            padding: 0,
            marginBottom: 24,
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Back
        </button>

        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "#EEF4F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <Star style={{ color: SAGE, width: 24, height: 24 }} fill={SAGE} />
        </div>

        <h1
          style={{
            fontWeight: 800,
            fontSize: 28,
            color: "#1a1a1a",
            marginBottom: 10,
            lineHeight: 1.2,
          }}
        >
          Unlock the full picture
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#666",
            lineHeight: 1.6,
            maxWidth: 320,
          }}
        >
          Everything HappySpend knows about your money, yours to keep.
        </p>
      </header>

      {/* Feature list */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 18,
          boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
          padding: "22px 20px",
          marginBottom: 16,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#999",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 16,
          }}
        >
          What you get
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {FEATURES.map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#EEF4F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Check style={{ color: SAGE, width: 13, height: 13, strokeWidth: 2.5 }} />
              </div>
              <span style={{ fontSize: 15, color: "#1a1a1a", fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing card */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 18,
          boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
          padding: "24px 20px",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontWeight: 800,
            fontSize: 36,
            color: SAGE,
            marginBottom: 4,
            letterSpacing: "-0.5px",
          }}
        >
          R49
          <span style={{ fontSize: 18, fontWeight: 600, color: "#888" }}> / month</span>
        </p>
        <p style={{ fontSize: 13, color: "#999", marginBottom: 24 }}>
          First 3 months · R69/month after
        </p>

        <button
          onClick={handleUnlock}
          style={{
            width: "100%",
            background: SAGE,
            color: "#FFFFFF",
            border: "none",
            borderRadius: 100,
            padding: "16px 0",
            fontFamily: DM,
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            marginBottom: 12,
          }}
        >
          Unlock HappySpend
        </button>

        <p style={{ fontSize: 13, color: "#999" }}>Cancel anytime. No commitment.</p>
      </div>

      {/* What stays free */}
      <div
        style={{
          background: "#F0EDE6",
          borderRadius: 14,
          padding: "16px 18px",
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 10,
          }}
        >
          Always free
        </p>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
          All logging · Dashboard · Weekly summary · Streaks · Habit tab · Persona progression · Reallocation
        </p>
      </div>
    </div>
  );
}
