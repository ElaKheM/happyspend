import { useGetEntries } from "@workspace/api-client-react";
import { formatMoney } from "@/lib/utils";
import { CategoryIcon } from "@/components/category-icon";
import { format } from "date-fns";
import { motion } from "framer-motion";

const DM = "'DM Sans', sans-serif";

export default function Entries() {
  const { data: entries, isLoading } = useGetEntries();

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

  const grouped = entries?.reduce((acc: Record<string, any[]>, entry) => {
    const date = format(new Date(entry.entryDate), "MMMM d, yyyy");
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  return (
    <div style={{ background: "#FAF9F6", minHeight: "100vh", fontFamily: DM, padding: "0 20px 40px" }}>

      {/* Header */}
      <header style={{ paddingTop: 48, marginBottom: 28 }}>
        <h1 style={{ fontFamily: DM, fontWeight: 700, fontSize: 28, color: "#1a1a1a" }}>History</h1>
        <p style={{ color: "#777", fontSize: 14, marginTop: 4 }}>Every step of your journey.</p>
      </header>

      {!entries?.length ? (
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto mb-5">
            <path d="M40 70 C40 70 15 55 15 35 C15 22 26 14 40 14 C54 14 65 22 65 35 C65 55 40 70 40 70 Z" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M40 14 L40 8 M33 16 L30 11 M47 16 L50 11" stroke="#7C9E8A" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="40" cy="38" r="8" stroke="#7C9E8A" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h3 style={{ fontFamily: DM, fontWeight: 700, fontSize: 18, color: "#1a1a1a", marginBottom: 8 }}>A fresh start</h3>
          <p style={{ color: "#777", fontSize: 14, lineHeight: 1.6 }}>Your logged entries will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {Object.entries(grouped || {}).map(([date, dayEntries], index) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                  paddingLeft: 4,
                }}
              >
                {date}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(dayEntries as any[]).map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 14,
                      borderLeft: "4px solid #7C9E8A",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "#EEF4F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CategoryIcon name={entry.categoryName || entry.categoryIcon || ""} size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: DM, fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>
                        {entry.description || entry.categoryName || "Entry"}
                      </p>
                      <p style={{ fontSize: 12, color: "#999", marginTop: 2, textTransform: "capitalize" }}>
                        {entry.inputMethod}
                      </p>
                    </div>
                    <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 16, color: "#1a1a1a" }}>
                      {formatMoney(entry.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
