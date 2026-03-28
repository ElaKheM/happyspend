import { useGetWeeklySummary } from "@workspace/api-client-react";
import { formatMoney } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";

const DM = "'DM Sans', sans-serif";

export default function Summary() {
  const { data: summary, isLoading } = useGetWeeklySummary();

  if (isLoading) {
    return (
      <div className="flex justify-center pt-20" style={{ background: "#FAF9F6", minHeight: "100vh" }}>
        <div
          className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: "#E8E4DC", borderTopColor: "#7C9E8A" }}
        />
      </div>
    );
  }

  if (!summary) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center p-10"
        style={{ background: "#FAF9F6", minHeight: "100vh", fontFamily: DM }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mb-6">
          <rect x="15" y="20" width="50" height="50" rx="6" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M15 36 L65 36" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M28 14 L28 28 M52 14 L52 28" stroke="#8B7355" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <h2 style={{ fontFamily: DM, fontWeight: 700, fontSize: 20, color: "#1a1a1a", marginBottom: 8 }}>
          Check back soon
        </h2>
        <p style={{ color: "#777", fontSize: 14, lineHeight: 1.6 }}>
          Your weekly summary will be ready at the end of the week.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "#FAF9F6", minHeight: "100vh", fontFamily: DM, paddingBottom: 60 }}>
      <div style={{ padding: "0 20px", maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <header style={{ paddingTop: 48, paddingBottom: 28, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <svg width="90" height="90" viewBox="0 0 120 120" fill="none">
              <rect x="25" y="30" width="70" height="75" rx="8" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M25 55 L95 55" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M40 20 L40 40 M80 20 L80 40" stroke="#8B7355" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M48 75 L58 87 L77 65" stroke="#7C9E8A" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: DM, fontWeight: 700, fontSize: 28, color: "#1a1a1a", marginBottom: 6 }}>
            Weekly Check-in
          </h1>
          <p style={{ color: "#777", fontSize: 15 }}>
            {format(new Date(summary.weekStart), "MMM d")} – {format(new Date(summary.weekEnd), "MMM d, yyyy")}
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* Narrative Card */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 18,
              borderLeft: "4px solid #7C9E8A",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              padding: "24px 22px",
            }}
          >
            <p style={{ fontFamily: DM, fontWeight: 700, fontSize: 20, color: "#1a1a1a", lineHeight: 1.4, marginBottom: 18 }}>
              {summary.narrative.openingLine}
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {summary.narrative.categoryHighlights.map((highlight: string, i: number) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: "#7C9E8A", marginTop: 2, flexShrink: 0, fontSize: 16 }}>·</span>
                  <span style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>{highlight}</span>
                </li>
              ))}
            </ul>
            {summary.narrative.overspendMessage && (
              <p style={{ color: "#8899AA", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                {summary.narrative.overspendMessage}
              </p>
            )}
            <p style={{ color: "#777", fontSize: 14, fontStyle: "italic", borderTop: "1px solid #EEE", paddingTop: 16, lineHeight: 1.6 }}>
              {summary.narrative.closingLine}
            </p>
          </div>

          {/* Milestone Celebrations */}
          {summary.newMilestones.length > 0 && summary.newMilestones.map((m: string, i: number) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                borderRadius: 18,
                borderLeft: "4px solid #B5956A",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                padding: "28px 22px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <svg width="70" height="70" viewBox="0 0 80 80" fill="none">
                  <path d="M40 18 L45 33 L62 33 L49 43 L53 58 L40 48 L27 58 L31 43 L18 33 L35 33 Z" stroke="#B5956A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M40 8 L40 4 M72 40 L76 40 M40 72 L40 76 M8 40 L4 40" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16 16 L13 13 M64 16 L67 13 M64 64 L67 67 M16 64 L13 67" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: DM, fontWeight: 700, fontSize: 20, color: "#1a1a1a", marginBottom: 8 }}>
                You hit a new milestone.
              </h3>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#B5956A", textTransform: "capitalize", marginBottom: 6 }}>
                {m.replace(/_/g, " ")}
              </div>
              <p style={{ color: "#777", fontSize: 13 }}>That's not small. Keep going.</p>
            </div>
          ))}

          {/* The Numbers */}
          <div>
            <h3 style={{ fontFamily: DM, fontWeight: 700, fontSize: 12, color: "#999", textAlign: "center", marginBottom: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              The Numbers
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Spent",    value: formatMoney(summary.weekSummary.totalSpent) },
                { label: "Budgeted", value: formatMoney(summary.weekSummary.totalBudgeted) },
                { label: "Days",     value: `${summary.weekSummary.daysLogged} / 7` },
                { label: "Entries",  value: summary.weekSummary.entriesLogged },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 16,
                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    padding: "20px 16px",
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    {label}
                  </p>
                  <p style={{ fontFamily: DM, fontWeight: 700, fontSize: 26, color: "#1a1a1a" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
