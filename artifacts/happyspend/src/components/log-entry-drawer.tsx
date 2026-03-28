import { useState, useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Mic, Camera, PenLine, Square } from "lucide-react";
import {
  useCreateEntry,
  useGetCategories,
  useGetDashboard,
  getGetDashboardQueryKey,
  getGetEntriesQueryKey,
  getGetCategoryStatusQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CategoryIcon } from "@/components/category-icon";

const DM = "'DM Sans', sans-serif";

const PERSONA_CONFIRMATIONS: Record<string, string> = {
  "The Steady Builder":      "Consistent. That's the builder in you.",
  "The Intentional Spender": "Intentional and logged. Well done.",
  "The Freedom Seeker":      "One step closer to freedom.",
  "The Debt Slayer":         "Tracked. The slayer knows where every rand goes.",
};

type VoiceStatus = "idle" | "listening" | "done" | "error";

function parseTranscript(text: string): { amount: string; description: string } {
  // Match amounts like "R50", "50 rand", "fifty", "50.50", "50,50"
  const currencyMatch = text.match(/R\s*(\d+(?:[.,]\d{1,2})?)/i);
  const numberMatch = text.match(/\b(\d+(?:[.,]\d{1,2})?)\b/);
  const match = currencyMatch ?? numberMatch;

  if (!match) return { amount: "", description: text.trim() };

  const raw = match[currencyMatch ? 1 : 0]!.replace(",", ".");
  const amount = parseFloat(raw).toString();

  const description = text
    .replace(match[0]!, "")
    .replace(/\b(rand|rands|r|spent|paid|cost|for|on|the|a|an|at|to|and|i|my)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { amount, description };
}

const isSpeechAvailable =
  typeof window !== "undefined" &&
  Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export function LogEntryDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"manual" | "voice" | "photo">("manual");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMsg, setConfirmationMsg] = useState("");

  // Shared form state
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  // Voice-specific state
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const { data: dashData } = useGetDashboard({ query: { staleTime: 1000 * 60 * 5 } });
  const { data: categories } = useGetCategories();
  const createEntry = useCreateEntry();
  const queryClient = useQueryClient();

  const personaName = dashData?.persona?.name ?? "";
  const personaConfirmation = PERSONA_CONFIRMATIONS[personaName] ?? "One more proof you're becoming someone who's good with money.";

  const resetForm = () => {
    setAmount("");
    setCategoryId("");
    setDescription("");
    setIsRecurring(false);
    setTab("manual");
    setShowConfirmation(false);
    setConfirmationMsg("");
    setVoiceStatus("idle");
    setTranscript("");
    stopRecognition();
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetForm, 300);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showConfirmation) {
      const delay = tab === "voice" ? 2000 : 2800;
      timeout = setTimeout(() => handleClose(), delay);
    }
    return () => clearTimeout(timeout);
  }, [showConfirmation]);

  // Cleanup recognition on unmount
  useEffect(() => () => stopRecognition(), []);

  function stopRecognition() {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    setVoiceStatus("idle");
  }

  function startListening() {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-ZA";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setVoiceStatus("listening");

    recognition.onresult = (event: any) => {
      const result = event.results[0]?.[0]?.transcript ?? "";
      setTranscript(result);
      const parsed = parseTranscript(result);
      setAmount(parsed.amount);
      setDescription(parsed.description);
      setVoiceStatus("done");
    };

    recognition.onerror = () => {
      setVoiceStatus("error");
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      if (voiceStatus === "listening") setVoiceStatus("error");
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch {
      setVoiceStatus("error");
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!amount || !categoryId) return;

    createEntry.mutate(
      {
        data: {
          amount: parseFloat(amount),
          categoryId,
          description: description || null,
          inputMethod: tab,
          entryDate: new Date().toISOString(),
          isRecurring,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCategoryStatusQueryKey() });
          setConfirmationMsg(personaConfirmation);
          setShowConfirmation(true);
        },
      }
    );
  };

  const categorySelector = (
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
                  width: 38, height: 38, borderRadius: 10,
                  background: isSelected ? "#D6E8DF" : "#F3F3F3",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
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
  );

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-30"
        style={{ background: "#7C9E8A", boxShadow: "0 6px 24px rgba(124,158,138,0.35)" }}
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 max-w-md mx-auto"
              style={{ background: "rgba(0,0,0,0.18)", backdropFilter: "blur(4px)" }}
            />

            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
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
                  <div className="mx-auto mb-5" style={{ width: 40, height: 4, background: "#DDD8CE", borderRadius: 100 }} />
                  <div className="flex justify-between items-center mb-5">
                    <h2 style={{ fontFamily: DM, fontWeight: 700, fontSize: 22, color: "#1a1a1a" }}>Log Spending</h2>
                    <button
                      onClick={handleClose}
                      className="flex items-center justify-center"
                      style={{ width: 36, height: 36, background: "#EEEBE4", borderRadius: "50%", color: "#666" }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex mb-6" style={{ background: "#EEEBE4", borderRadius: 14, padding: 4, gap: 2 }}>
                    <TabButton active={tab === "manual"} onClick={() => setTab("manual")} icon={<PenLine className="w-4 h-4" />} label="Manual" />
                    <TabButton active={tab === "voice"}  onClick={() => setTab("voice")}  icon={<Mic className="w-4 h-4" />}     label="Voice"  />
                    <TabButton active={tab === "photo"}  onClick={() => setTab("photo")}  icon={<Camera className="w-4 h-4" />}  label="Photo"  />
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: showConfirmation ? 0 : "0 20px" }}>
                {showConfirmation ? (
                  <div className="flex flex-col items-center justify-center text-center" style={{ padding: "60px 40px 80px", minHeight: 400 }}>
                    <div style={{ marginBottom: 28 }}>
                      <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
                        <circle cx="60" cy="60" r="42" stroke="#7C9E8A" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="9 5" />
                        <path d="M40 60 L54 75 L82 44" stroke="#7C9E8A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18 20 L23 25 M102 20 L97 25 M18 100 L23 95 M102 100 L97 95" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h2 style={{ fontFamily: DM, fontWeight: 700, fontSize: 32, color: "#1a1a1a", marginBottom: 12 }}>Logged.</h2>
                    <p style={{ color: "#777", fontSize: 15, maxWidth: 240, lineHeight: 1.6, marginBottom: 36 }}>
                      {confirmationMsg}
                    </p>
                    <button
                      onClick={handleClose}
                      style={{
                        width: "100%", background: "#7C9E8A", color: "#fff",
                        borderRadius: 100, padding: "16px 0", fontFamily: DM,
                        fontSize: 16, fontWeight: 600, border: "none", cursor: "pointer",
                      }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    {/* ── MANUAL TAB ── */}
                    {tab === "manual" && (
                      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22, paddingBottom: 32 }}>
                        {/* Amount */}
                        <div>
                          <label style={{ fontFamily: DM, fontWeight: 600, fontSize: 13, color: "#555", display: "block", marginBottom: 8 }}>Amount</label>
                          <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontFamily: DM, fontWeight: 600, fontSize: 20, color: "#7C9E8A" }}>R</span>
                            <input
                              type="number" step="0.01" placeholder="0.00"
                              value={amount} onChange={(e) => setAmount(e.target.value)} required
                              style={{
                                width: "100%", paddingLeft: 36, paddingRight: 16, height: 60,
                                background: "#FFFFFF", border: "none", borderRadius: 14,
                                fontFamily: DM, fontSize: 22, fontWeight: 700, color: "#1a1a1a",
                                boxShadow: "0 1px 6px rgba(0,0,0,0.07)", outline: "none", boxSizing: "border-box",
                              }}
                            />
                          </div>
                        </div>

                        {categorySelector}

                        {/* Description */}
                        <div>
                          <label style={{ fontFamily: DM, fontWeight: 600, fontSize: 13, color: "#555", display: "block", marginBottom: 8 }}>
                            What was it? <span style={{ color: "#999", fontWeight: 400 }}>(optional)</span>
                          </label>
                          <input
                            type="text" placeholder="Coffee, groceries, etc…"
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            style={{
                              width: "100%", padding: "14px 16px", background: "#FFFFFF",
                              border: "none", borderRadius: 14, fontFamily: DM, fontSize: 15,
                              color: "#1a1a1a", boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                              outline: "none", boxSizing: "border-box",
                            }}
                          />
                        </div>

                        {/* Repeats monthly */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
                          <span style={{ fontFamily: DM, fontSize: 14, color: "#666", fontWeight: 500 }}>Repeats monthly</span>
                          <button
                            type="button" onClick={() => setIsRecurring(!isRecurring)}
                            style={{
                              width: 44, height: 26, borderRadius: 100,
                              background: isRecurring ? "#7C9E8A" : "#DDD8CE",
                              border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
                            }}
                            aria-label="Toggle recurring"
                          >
                            <span style={{
                              position: "absolute", top: 3, left: isRecurring ? 21 : 3,
                              width: 20, height: 20, borderRadius: "50%", background: "#FFFFFF",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s",
                            }} />
                          </button>
                        </div>

                        <button
                          type="submit" disabled={!amount || !categoryId || createEntry.isPending}
                          style={{
                            width: "100%", background: "#7C9E8A", color: "#fff", borderRadius: 100,
                            padding: "16px 0", fontFamily: DM, fontSize: 16, fontWeight: 600, border: "none",
                            cursor: "pointer", opacity: !amount || !categoryId ? 0.4 : 1, marginTop: 4,
                          }}
                        >
                          {createEntry.isPending ? "Saving…" : "Log it"}
                        </button>
                      </form>
                    )}

                    {/* ── VOICE TAB ── */}
                    {tab === "voice" && (
                      <div style={{ paddingBottom: 32 }}>
                        {!isSpeechAvailable ? (
                          /* Not available */
                          <div className="flex flex-col items-center text-center" style={{ padding: "48px 16px 24px" }}>
                            <div style={{
                              width: 72, height: 72, borderRadius: "50%", background: "#EEF4F0",
                              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
                            }}>
                              <Mic className="w-8 h-8" style={{ color: "#7C9E8A" }} />
                            </div>
                            <p style={{ fontSize: 14, color: "#777", lineHeight: 1.7, marginBottom: 20 }}>
                              Voice input works best in Chrome.<br />You can still log manually below.
                            </p>
                            <button
                              onClick={() => setTab("manual")}
                              style={{
                                background: "#EEF4F0", color: "#7C9E8A", border: "none", borderRadius: 100,
                                padding: "12px 28px", fontFamily: DM, fontWeight: 600, fontSize: 14, cursor: "pointer",
                              }}
                            >
                              Switch to Manual
                            </button>
                          </div>
                        ) : voiceStatus === "idle" ? (
                          /* Idle — record button */
                          <div className="flex flex-col items-center" style={{ paddingTop: 48, paddingBottom: 24 }}>
                            <motion.button
                              onClick={startListening}
                              whileTap={{ scale: 0.94 }}
                              style={{
                                width: 72, height: 72, borderRadius: "50%", background: "#7C9E8A",
                                border: "none", cursor: "pointer", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                boxShadow: "0 6px 28px rgba(124,158,138,0.4)",
                              }}
                            >
                              <Mic className="w-8 h-8 text-white" />
                            </motion.button>
                            <p style={{ fontSize: 13, color: "#999", marginTop: 14, fontFamily: DM }}>
                              tap to speak
                            </p>
                            <p style={{ fontSize: 12, color: "#BBB", marginTop: 6, textAlign: "center", maxWidth: 220, lineHeight: 1.5 }}>
                              Say something like "spent R50 on coffee"
                            </p>
                          </div>
                        ) : voiceStatus === "listening" ? (
                          /* Listening — pulsing button */
                          <div className="flex flex-col items-center" style={{ paddingTop: 48, paddingBottom: 24 }}>
                            <motion.button
                              onClick={() => stopRecognition()}
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                              style={{
                                width: 72, height: 72, borderRadius: "50%", background: "#7C9E8A",
                                border: "none", cursor: "pointer", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                boxShadow: "0 6px 36px rgba(124,158,138,0.55)",
                                position: "relative",
                              }}
                            >
                              <Square className="w-6 h-6 text-white" fill="white" />
                            </motion.button>
                            {/* Ripple ring */}
                            <motion.div
                              animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                              transition={{ repeat: Infinity, duration: 1.4, ease: "easeOut" }}
                              style={{
                                position: "absolute",
                                width: 72, height: 72,
                                borderRadius: "50%",
                                border: "2px solid #7C9E8A",
                                pointerEvents: "none",
                                marginTop: -86,
                              }}
                            />
                            <p style={{ fontSize: 14, color: "#7C9E8A", marginTop: 24, fontFamily: DM, fontWeight: 600 }}>
                              Listening…
                            </p>
                            <p style={{ fontSize: 12, color: "#BBB", marginTop: 4 }}>tap to stop</p>
                          </div>
                        ) : voiceStatus === "error" ? (
                          /* Error */
                          <div className="flex flex-col items-center text-center" style={{ paddingTop: 40, paddingBottom: 24 }}>
                            <div style={{
                              width: 72, height: 72, borderRadius: "50%", background: "#F0EDE6",
                              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                            }}>
                              <Mic className="w-8 h-8" style={{ color: "#B5956A" }} />
                            </div>
                            <p style={{ fontSize: 14, color: "#777", marginBottom: 20, lineHeight: 1.6 }}>
                              Couldn't catch that — try again<br />or use manual entry.
                            </p>
                            <div style={{ display: "flex", gap: 10 }}>
                              <button
                                onClick={() => { setVoiceStatus("idle"); setTranscript(""); }}
                                style={{
                                  background: "#7C9E8A", color: "#fff", border: "none", borderRadius: 100,
                                  padding: "12px 22px", fontFamily: DM, fontWeight: 600, fontSize: 13, cursor: "pointer",
                                }}
                              >
                                Try again
                              </button>
                              <button
                                onClick={() => setTab("manual")}
                                style={{
                                  background: "#EEEBE4", color: "#666", border: "none", borderRadius: 100,
                                  padding: "12px 22px", fontFamily: DM, fontWeight: 600, fontSize: 13, cursor: "pointer",
                                }}
                              >
                                Manual
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Done — show transcript + editable form */
                          <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 4, paddingBottom: 32 }}>
                            {/* Transcript card */}
                            <div style={{
                              background: "#EEF4F0", borderRadius: 14, padding: "14px 16px",
                              borderLeft: "4px solid #7C9E8A",
                            }}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: "#7C9E8A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                                I heard
                              </p>
                              <p style={{ fontFamily: DM, fontSize: 14, color: "#1a1a1a", fontStyle: "italic" }}>
                                "{transcript}"
                              </p>
                            </div>

                            {/* Editable amount */}
                            <div>
                              <label style={{ fontFamily: DM, fontWeight: 600, fontSize: 13, color: "#555", display: "block", marginBottom: 8 }}>Amount</label>
                              <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontFamily: DM, fontWeight: 600, fontSize: 20, color: "#7C9E8A" }}>R</span>
                                <input
                                  type="number" step="0.01" placeholder="0.00"
                                  value={amount} onChange={(e) => setAmount(e.target.value)}
                                  style={{
                                    width: "100%", paddingLeft: 36, paddingRight: 16, height: 60,
                                    background: "#FFFFFF", border: "none", borderRadius: 14,
                                    fontFamily: DM, fontSize: 22, fontWeight: 700, color: "#1a1a1a",
                                    boxShadow: "0 1px 6px rgba(0,0,0,0.07)", outline: "none", boxSizing: "border-box",
                                  }}
                                />
                              </div>
                            </div>

                            {/* Editable description */}
                            <div>
                              <label style={{ fontFamily: DM, fontWeight: 600, fontSize: 13, color: "#555", display: "block", marginBottom: 8 }}>
                                What was it? <span style={{ color: "#999", fontWeight: 400 }}>(optional)</span>
                              </label>
                              <input
                                type="text" placeholder="Coffee, groceries, etc…"
                                value={description} onChange={(e) => setDescription(e.target.value)}
                                style={{
                                  width: "100%", padding: "14px 16px", background: "#FFFFFF",
                                  border: "none", borderRadius: 14, fontFamily: DM, fontSize: 15,
                                  color: "#1a1a1a", boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                                  outline: "none", boxSizing: "border-box",
                                }}
                              />
                            </div>

                            {categorySelector}

                            {/* Log + re-record */}
                            <div style={{ display: "flex", gap: 10 }}>
                              <button
                                onClick={() => { setVoiceStatus("idle"); setTranscript(""); setAmount(""); setDescription(""); }}
                                style={{
                                  flex: "0 0 auto", background: "#EEEBE4", color: "#666", border: "none",
                                  borderRadius: 100, padding: "0 18px", height: 52, fontFamily: DM,
                                  fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                                }}
                              >
                                Re-record
                              </button>
                              <button
                                onClick={() => handleSubmit()}
                                disabled={!amount || !categoryId || createEntry.isPending}
                                style={{
                                  flex: 1, background: "#7C9E8A", color: "#fff", border: "none", borderRadius: 100,
                                  height: 52, fontFamily: DM, fontSize: 16, fontWeight: 600, cursor: "pointer",
                                  opacity: !amount || !categoryId ? 0.4 : 1,
                                }}
                              >
                                {createEntry.isPending ? "Saving…" : "Log it"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── PHOTO TAB ── */}
                    {tab === "photo" && (
                      <div className="flex flex-col items-center justify-center text-center" style={{ padding: "60px 24px" }}>
                        <div style={{
                          width: 80, height: 80, borderRadius: "50%", background: "#EEF4F0",
                          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
                        }}>
                          <Camera className="w-9 h-9" style={{ color: "#7C9E8A" }} />
                        </div>
                        <h3 style={{ fontFamily: DM, fontWeight: 700, fontSize: 18, color: "#1a1a1a", marginBottom: 8 }}>Snap a receipt</h3>
                        <p style={{ color: "#999", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Coming soon. Use the manual tab for now!</p>
                        <button
                          onClick={() => setTab("manual")}
                          style={{
                            background: "#EEF4F0", color: "#7C9E8A", border: "none", borderRadius: 100,
                            padding: "12px 28px", fontFamily: DM, fontWeight: 600, fontSize: 14, cursor: "pointer",
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

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm transition-all"
      style={{
        fontFamily: DM, fontWeight: active ? 600 : 400,
        color: active ? "#1a1a1a" : "#999",
        background: active ? "#FFFFFF" : "transparent",
        boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
        fontSize: 13, border: "none", cursor: "pointer",
      }}
    >
      {icon} {label}
    </button>
  );
}
