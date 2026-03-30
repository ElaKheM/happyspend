import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";

const DM = "'DM Sans', sans-serif";
const SAGE = "#7C9E8A";

const PERSONA_DESCRIPTIONS: Record<string, string> = {
  "The Steady Builder":
    "Someone who once felt uncertain about money — and showed up anyway, for 30 days straight. Calm. Consistent. No drama. That's what a Steady Builder is. And that's what you've become.",
  "The Intentional Spender":
    "Someone who once felt surprised by where money went — and decided to pay attention instead. Every entry a choice. That's what intentional means. And that's what you've become.",
  "The Freedom Seeker":
    "Someone who once felt the gap between the life they wanted and the money they had — and started building the bridge. That's what a Freedom Seeker does. And that's what you've become.",
  "The Debt Slayer":
    "Someone who once felt the weight of owing — and decided to do something about it, one logged entry at a time. Focused. Strategic. That's what you've become.",
};

const MONTH_END_MAP: Record<number, string> = {
  0: "uncertain",
  1: "surprised",
  2: "in control but not fully",
  3: "guilty",
};

function Section({
  show,
  children,
  className,
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ConfettiPiece {
  id: number;
  x: number;
  size: number;
  color: string;
  delay: number;
}

export default function SpendDnaReveal() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [data, setData] = useState<any>(null);
  const [visible, setVisible] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetch("/api/spend-dna")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setTimeout(() => setVisible(1), 200);
        setTimeout(() => setVisible(2), 1700);
        setTimeout(() => setVisible(3), 3200);
        setTimeout(() => setVisible(4), 4700);
        setTimeout(() => setVisible(5), 6200);
      })
      .catch(() => setVisible(1));
  }, []);

  const handleCTA = async () => {
    if (completing) return;
    setCompleting(true);

    const pieces: ConfettiPiece[] = Array.from({ length: 32 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      size: 6 + Math.random() * 8,
      color: Math.random() > 0.5 ? SAGE : "#FFFFFF",
      delay: Math.random() * 0.4,
    }));
    setConfetti(pieces);

    try {
      await fetch("/api/spend-dna/unlock", { method: "POST" });
    } catch (_) {}

    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });

    setTimeout(() => navigate("/"), 2300);
  };

  const emotionalProfile = data?.user?.emotionalProfile;
  const monthEndAnswer = emotionalProfile?.month_end ?? 0;
  const feelingWord = MONTH_END_MAP[monthEndAnswer] ?? "uncertain";
  const personaName: string = data?.user?.personaName ?? "";
  const personaDescription = PERSONA_DESCRIPTIONS[personaName] ?? "";

  const stats = data?.stats ?? { streakCount: 30, totalEntriesThisMonth: 0, topCategoryName: "—" };
  const insights = data?.insights ?? {};

  const isPremium: boolean = data?.user?.isPremium ?? false;
  const { logTimeOfDay, topCategoryDayPercent, weeklyTrend } = insights;

  return (
    <div
      style={{
        background: "#FAF9F6",
        minHeight: "100vh",
        fontFamily: DM,
        padding: "60px 24px 60px",
        maxWidth: 430,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      {/* Section 1: Callback */}
      <Section show={visible >= 1}>
        <p
          style={{
            fontFamily: DM,
            fontWeight: 700,
            fontSize: 22,
            color: "#1a1a1a",
            lineHeight: 1.45,
          }}
        >
          30 days ago, you told us money made you feel{" "}
          <span style={{ color: SAGE }}>{feelingWord}</span>.
        </p>
      </Section>

      {/* Section 2: Acknowledgement + stat pills */}
      <Section show={visible >= 2}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <p
            style={{
              fontFamily: DM,
              fontWeight: 600,
              fontSize: 18,
              color: "#333",
              lineHeight: 1.5,
            }}
          >
            Look at what you've built since then.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <StatPill value={`${stats.streakCount}`} label="days" />
            <StatPill value={`${stats.totalEntriesThisMonth}`} label="entries" />
            <StatPill value={stats.topCategoryName} label="top category" small />
          </div>
        </div>
      </Section>

      {/* Section 3: Persona reveal */}
      <Section show={visible >= 3}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            borderLeft: `4px solid ${SAGE}`,
            boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
            padding: "28px 22px",
          }}
        >
          <p
            style={{
              fontFamily: DM,
              fontWeight: 800,
              fontSize: 32,
              color: SAGE,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            {personaName || "Your Persona"}
          </p>
          {personaDescription ? (
            <p
              style={{
                fontFamily: DM,
                fontSize: 15,
                color: "#444",
                lineHeight: 1.7,
              }}
            >
              {personaDescription}
            </p>
          ) : (
            <p style={{ color: "#999", fontSize: 14 }}>
              Keep logging to build your identity.
            </p>
          )}
        </div>
      </Section>

      {/* Section 4: Spend DNA Insights */}
      <Section show={visible >= 4}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2
            style={{
              fontFamily: DM,
              fontWeight: 700,
              fontSize: 18,
              color: "#1a1a1a",
              marginBottom: 4,
            }}
          >
            Here's what your 30 days revealed.
          </h2>

          {/* Insight 1: Free */}
          <InsightCard
            text={
              logTimeOfDay
                ? `You log most in the ${logTimeOfDay}. That's your money clarity window — protect it.`
                : "You've been logging consistently. That's your habit forming."
            }
            locked={false}
          />

          {/* Insight 2 */}
          <InsightCard
            text={
              topCategoryDayPercent
                ? `${topCategoryDayPercent.percent}% of your ${topCategoryDayPercent.categoryName} spend happens on ${topCategoryDayPercent.dayName}. That's not a problem. That's a pattern.`
                : "Your spending has a day-of-week pattern. That's not a problem. That's a pattern."
            }
            locked={!isPremium}
          />

          {/* Insight 3 */}
          <InsightCard
            text={
              weeklyTrend
                ? `Your daily spend ${weeklyTrend.direction} by R${weeklyTrend.amount} from your first week to your last. ${weeklyTrend.message}`
                : "Your spending pattern changed between week one and week four. Worth knowing."
            }
            locked={!isPremium}
          />

          {/* Upgrade card — only for free users */}
          {!isPremium && (
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                padding: "22px 20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: DM,
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#1a1a1a",
                  marginBottom: 4,
                }}
              >
                Unlock your full Spend DNA
              </p>
              <p
                style={{
                  fontFamily: DM,
                  fontSize: 22,
                  fontWeight: 800,
                  color: SAGE,
                  marginBottom: 16,
                }}
              >
                R49/month
              </p>
              <button
                onClick={() => navigate("/upgrade")}
                style={{
                  width: "100%",
                  background: SAGE,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 100,
                  padding: "14px 0",
                  fontFamily: DM,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  marginBottom: 10,
                }}
              >
                See everything
              </button>
              <p style={{ fontSize: 12, color: "#999" }}>
                First 3 months — cancel anytime
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Section 5: CTA */}
      <Section show={visible >= 5}>
        <button
          onClick={handleCTA}
          disabled={completing}
          style={{
            width: "100%",
            background: completing ? "#A8C4B4" : SAGE,
            color: "#FFFFFF",
            border: "none",
            borderRadius: 100,
            padding: "18px 0",
            fontFamily: DM,
            fontWeight: 700,
            fontSize: 17,
            cursor: completing ? "default" : "pointer",
            boxShadow: "0 4px 20px rgba(124,158,138,0.35)",
            transition: "background 0.2s",
          }}
        >
          This is me
        </button>
      </Section>

      {/* Confetti overlay */}
      <AnimatePresence>
        {confetti.length > 0 && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 9999,
              overflow: "hidden",
            }}
          >
            {confetti.map((piece) => (
              <motion.div
                key={piece.id}
                initial={{ y: "100vh", x: `${piece.x}vw`, opacity: 1 }}
                animate={{ y: "-20px", opacity: 0 }}
                transition={{
                  duration: 1.8,
                  delay: piece.delay,
                  ease: "easeOut",
                }}
                style={{
                  position: "absolute",
                  width: piece.size,
                  height: piece.size,
                  borderRadius: "50%",
                  background: piece.color,
                  top: 0,
                  left: 0,
                  boxShadow:
                    piece.color === "#FFFFFF"
                      ? "0 0 4px rgba(0,0,0,0.15)"
                      : "none",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatPill({
  value,
  label,
  small,
}: {
  value: string;
  label: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "#FFFFFF",
        borderRadius: 14,
        boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
        padding: "14px 10px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontFamily: DM,
          fontWeight: 800,
          fontSize: small ? 13 : 22,
          color: SAGE,
          lineHeight: 1.1,
          wordBreak: "break-word",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as const,
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: 11, color: "#999", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function InsightCard({ text, locked }: { text: string; locked: boolean }) {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 14,
          borderLeft: locked ? "4px solid #E8E4DC" : `4px solid ${SAGE}`,
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          padding: "16px 16px",
          filter: locked ? "blur(4px)" : "none",
          userSelect: locked ? "none" : "auto",
        }}
      >
        <p style={{ fontFamily: DM, fontSize: 14, color: "#444", lineHeight: 1.65 }}>
          {text}
        </p>
      </div>
      {locked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "rgba(250,249,246,0.92)",
              borderRadius: 100,
              padding: "6px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", fontFamily: DM }}>
              Premium
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
