import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { formatMoney } from "@/lib/utils";

const DM = "'DM Sans', sans-serif";

type OtherCategory = { id: string; name: string; remaining: number };

export interface OverspendData {
  categoryId: string;
  categoryName: string;
  overspendAmount: number;
  weekStart: string;
  entryId: string;
  otherCategories: OtherCategory[];
}

interface Props {
  overspendData: OverspendData;
  onClose: () => void;
}

export function ReallocationSheet({ overspendData, onClose }: Props) {
  const [status, setStatus] = useState<"options" | "success">("options");
  const [successMsg, setSuccessMsg] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleReallocate = async (fromCategoryId: string) => {
    if (isPending) return;
    setIsPending(true);
    try {
      const res = await fetch("/api/reallocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromCategoryId,
          toCategoryId: overspendData.categoryId,
          amount: overspendData.overspendAmount,
          weekStart: overspendData.weekStart,
          entryId: overspendData.entryId,
        }),
      });
      const data = await res.json();
      setSuccessMsg(data.celebrationMessage ?? "Adjusted. You noticed and you acted.");
      setStatus("success");
      setTimeout(() => onClose(), 2500);
    } catch {
      setIsPending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="reallocation-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          maxWidth: 448,
          margin: "0 auto",
        }}
      >
        <motion.div
          key="reallocation-panel"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          style={{
            background: "#FAF9F6",
            borderRadius: "24px 24px 0 0",
            padding: "28px 20px 44px",
            maxHeight: "78vh",
            overflowY: "auto",
            fontFamily: DM,
          }}
        >
          <div
            style={{
              width: 40, height: 4, background: "#DDD8CE", borderRadius: 100,
              margin: "0 auto 24px",
            }}
          />

          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "24px 20px 8px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "#EEF4F0",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <Check style={{ color: "#7C9E8A", width: 28, height: 28, strokeWidth: 2.5 }} />
              </div>
              <p style={{
                fontWeight: 600, fontSize: 16,
                color: "#1a1a1a", lineHeight: 1.6, maxWidth: 300, margin: "0 auto",
              }}>
                {successMsg}
              </p>
            </div>
          ) : (
            <>
              <h3 style={{ fontWeight: 700, fontSize: 18, color: "#1a1a1a", marginBottom: 8 }}>
                {overspendData.categoryName} is {formatMoney(overspendData.overspendAmount)} over this week's plan.
              </h3>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 24, lineHeight: 1.55 }}>
                Want to cover it from somewhere else?
              </p>

              {overspendData.otherCategories.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {overspendData.otherCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleReallocate(cat.id)}
                      disabled={isPending}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "13px 16px",
                        background: "#FFFFFF",
                        borderRadius: 14,
                        border: "none",
                        borderLeft: "4px solid #7C9E8A",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                        cursor: isPending ? "not-allowed" : "pointer",
                        textAlign: "left",
                        opacity: isPending ? 0.6 : 1,
                        transition: "opacity 0.15s",
                      }}
                    >
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: "#EEF4F0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <CategoryIcon name={cat.name} size={20} />
                      </div>
                      <span style={{ fontFamily: DM, fontWeight: 600, fontSize: 14, color: "#1a1a1a", flex: 1 }}>
                        {cat.name}
                      </span>
                      <span style={{ fontSize: 13, color: "#7C9E8A", fontWeight: 600 }}>
                        {formatMoney(cat.remaining)} remaining
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: "20px 0 24px",
                  textAlign: "center",
                  color: "#999",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}>
                  No other categories have budget remaining this week.
                </div>
              )}

              <button
                onClick={onClose}
                style={{
                  display: "block", width: "100%",
                  background: "none", border: "none",
                  fontFamily: DM, fontSize: 14, color: "#9C9690",
                  textAlign: "center", padding: "10px 0",
                  cursor: "pointer",
                }}
              >
                Skip for now
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
