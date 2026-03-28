import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Mic, Camera, PenLine } from "lucide-react";
import {
  useCreateEntry,
  useGetCategories,
  getGetDashboardQueryKey,
  getGetEntriesQueryKey,
  getGetCategoryStatusQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CategoryIcon } from "@/components/category-icon";
import { cn } from "@/lib/utils";

const DM = "'DM Sans', sans-serif";

export function LogEntryDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"manual" | "voice" | "photo">("manual");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");

  const { data: categories } = useGetCategories();
  const createEntry = useCreateEntry();
  const queryClient = useQueryClient();

  const resetForm = () => {
    setAmount("");
    setCategoryId("");
    setDescription("");
    setTab("manual");
    setShowConfirmation(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetForm, 300);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showConfirmation) {
      timeout = setTimeout(() => {
        handleClose();
      }, 2800);
    }
    return () => clearTimeout(timeout);
  }, [showConfirmation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    createEntry.mutate(
      {
        data: {
          amount: parseFloat(amount),
          categoryId,
          description: description || null,
          inputMethod: tab,
          entryDate: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCategoryStatusQueryKey() });
          setShowConfirmation(true);
        },
      }
    );
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-30"
        style={{
          background: "#7C9E8A",
          boxShadow: "0 6px 24px rgba(124,158,138,0.35)",
        }}
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 max-w-md mx-auto"
              style={{ background: "rgba(0,0,0,0.18)", backdropFilter: "blur(4px)" }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 flex flex-col"
              style={{
                background: "#FAF9F6",
                borderRadius: "24px 24px 0 0",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.12)",
                maxHeight: "88vh",
                fontFamily: DM,
              }}
            >
              {!showConfirmation && (
                <div style={{ padding: "20px 20px 0" }}>
                  {/* Handle */}
                  <div
                    className="mx-auto mb-5"
                    style={{ width: 40, height: 4, background: "#DDD8CE", borderRadius: 100 }}
                  />

                  <div className="flex justify-between items-center mb-5">
                    <h2 style={{ fontFamily: DM, fontWeight: 700, fontSize: 22, color: "#1a1a1a" }}>
                      Log Spending
                    </h2>
                    <button
                      onClick={handleClose}
                      className="flex items-center justify-center"
                      style={{
                        width: 36,
                        height: 36,
                        background: "#EEEBE4",
                        borderRadius: "50%",
                        color: "#666",
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tab bar */}
                  <div
                    className="flex mb-6"
                    style={{ background: "#EEEBE4", borderRadius: 14, padding: 4, gap: 2 }}
                  >
                    <TabButton active={tab === "manual"} onClick={() => setTab("manual")} icon={<PenLine className="w-4 h-4" />} label="Manual" />
                    <TabButton active={tab === "voice"}  onClick={() => setTab("voice")}  icon={<Mic className="w-4 h-4" />}     label="Voice" />
                    <TabButton active={tab === "photo"}  onClick={() => setTab("photo")}  icon={<Camera className="w-4 h-4" />}  label="Photo" />
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: showConfirmation ? 0 : "0 20px" }}>
                {showConfirmation ? (
                  <div
                    className="flex flex-col items-center justify-center text-center"
                    style={{ padding: "60px 40px 80px", minHeight: 400 }}
                  >
                    <div style={{ marginBottom: 28 }}>
                      <svg width="110" height="110" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="60" cy="60" r="42" stroke="#7C9E8A" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="9 5" />
                        <path d="M40 60 L54 75 L82 44" stroke="#7C9E8A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18 20 L23 25 M102 20 L97 25 M18 100 L23 95 M102 100 L97 95" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h2 style={{ fontFamily: DM, fontWeight: 700, fontSize: 32, color: "#1a1a1a", marginBottom: 12 }}>
                      Logged.
                    </h2>
                    <p style={{ color: "#777", fontSize: 15, maxWidth: 240, lineHeight: 1.6, marginBottom: 36 }}>
                      One more proof you're becoming someone who's good with money.
                    </p>
                    <button
                      onClick={handleClose}
                      style={{
                        width: "100%",
                        background: "#7C9E8A",
                        color: "#fff",
                        borderRadius: 100,
                        padding: "16px 0",
                        fontFamily: DM,
                        fontSize: 16,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    {tab === "manual" && (
                      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22, paddingBottom: 32 }}>

                        {/* Amount */}
                        <div>
                          <label style={{ fontFamily: DM, fontWeight: 600, fontSize: 13, color: "#555", display: "block", marginBottom: 8 }}>
                            Amount
                          </label>
                          <div style={{ position: "relative" }}>
                            <span
                              style={{
                                position: "absolute",
                                left: 16,
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontFamily: DM,
                                fontWeight: 600,
                                fontSize: 20,
                                color: "#7C9E8A",
                              }}
                            >
                              R
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              required
                              style={{
                                width: "100%",
                                paddingLeft: 36,
                                paddingRight: 16,
                                height: 60,
                                background: "#FFFFFF",
                                border: "none",
                                borderRadius: 14,
                                fontFamily: DM,
                                fontSize: 22,
                                fontWeight: 700,
                                color: "#1a1a1a",
                                boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                        </div>

                        {/* Category */}
                        <div>
                          <label style={{ fontFamily: DM, fontWeight: 600, fontSize: 13, color: "#555", display: "block", marginBottom: 8 }}>
                            Category
                          </label>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {categories?.map((c) => {
                              const isSelected = categoryId === c.id;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => setCategoryId(c.id)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 14,
                                    padding: "13px 16px",
                                    background: isSelected ? "#EEF4F0" : "#FFFFFF",
                                    borderRadius: 14,
                                    borderLeft: `4px solid ${isSelected ? "#7C9E8A" : "transparent"}`,
                                    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 0.15s",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 38,
                                      height: 38,
                                      borderRadius: 10,
                                      background: isSelected ? "#D6E8DF" : "#F3F3F3",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <CategoryIcon name={c.name} size={20} />
                                  </div>
                                  <span style={{ fontFamily: DM, fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>
                                    {c.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label style={{ fontFamily: DM, fontWeight: 600, fontSize: 13, color: "#555", display: "block", marginBottom: 8 }}>
                            What was it? <span style={{ color: "#999", fontWeight: 400 }}>(optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Coffee, groceries, etc…"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "14px 16px",
                              background: "#FFFFFF",
                              border: "none",
                              borderRadius: 14,
                              fontFamily: DM,
                              fontSize: 15,
                              color: "#1a1a1a",
                              boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={!amount || !categoryId || createEntry.isPending}
                          style={{
                            width: "100%",
                            background: "#7C9E8A",
                            color: "#fff",
                            borderRadius: 100,
                            padding: "16px 0",
                            fontFamily: DM,
                            fontSize: 16,
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                            opacity: !amount || !categoryId ? 0.4 : 1,
                            marginTop: 4,
                          }}
                        >
                          {createEntry.isPending ? "Saving…" : "Log it"}
                        </button>
                      </form>
                    )}

                    {tab !== "manual" && (
                      <div
                        className="flex flex-col items-center justify-center text-center"
                        style={{ padding: "60px 24px" }}
                      >
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            background: "#EEF4F0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 20,
                          }}
                        >
                          {tab === "voice"
                            ? <Mic className="w-9 h-9" style={{ color: "#7C9E8A" }} />
                            : <Camera className="w-9 h-9" style={{ color: "#7C9E8A" }} />}
                        </div>
                        <h3 style={{ fontFamily: DM, fontWeight: 700, fontSize: 18, color: "#1a1a1a", marginBottom: 8 }}>
                          {tab === "voice" ? "Just say what you bought" : "Snap a receipt"}
                        </h3>
                        <p style={{ color: "#999", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                          Coming soon. Use the manual tab for now!
                        </p>
                        <button
                          onClick={() => setTab("manual")}
                          style={{
                            background: "#EEF4F0",
                            color: "#7C9E8A",
                            border: "none",
                            borderRadius: 100,
                            padding: "12px 28px",
                            fontFamily: DM,
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: "pointer",
                          }}
                        >
                          Switch to Manual
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm transition-all"
      style={{
        fontFamily: DM,
        fontWeight: active ? 600 : 400,
        color: active ? "#1a1a1a" : "#999",
        background: active ? "#FFFFFF" : "transparent",
        boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
        fontSize: 13,
        border: "none",
        cursor: "pointer",
      }}
    >
      {icon} {label}
    </button>
  );
}
