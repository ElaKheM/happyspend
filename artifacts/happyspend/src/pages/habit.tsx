import { useGetMe, useGetDashboard } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { format, getDaysInMonth, startOfMonth, isSameDay } from "date-fns";
import { useLocation } from "wouter";

const DM = "'DM Sans', sans-serif";
const SAGE = "#7C9E8A";
const GOAL = 66;
const FIRST_UNLOCK = 30;

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]!);
}

export default function Habit() {
  const { data: user } = useGetMe({ query: { staleTime: 1000 * 30 } });
  const { data: dashData } = useGetDashboard({ query: { staleTime: 1000 * 30 } });
  const [, navigate] = useLocation();

  const streak = user?.streakCount ?? 0;
  const longestStreak = user?.longestStreak ?? 0;
  const lastLoggedDate = user?.lastLoggedDate ?? null;

  // Days logged this month (from entries, one per day)
  const recentEntries = dashData?.recentEntries ?? [];
  const loggedDaysThisMonth = new Set<number>();
  const now = new Date();
  const monthStr = format(now, "yyyy-MM");
  recentEntries.forEach((e: any) => {
    if (e.entryDate?.startsWith(monthStr)) {
      const day = parseInt(e.entryDate.split("-")[2], 10);
      loggedDaysThisMonth.add(day);
    }
  });

  // Also count last_logged_date if in this month
  if (lastLoggedDate?.startsWith(monthStr)) {
    const day = parseInt(lastLoggedDate.split("-")[2], 10);
    loggedDaysThisMonth.add(day);
  }

  const today = now.getDate();
  const daysInMonth = getDaysInMonth(now);

  // Countdown copy
  const daysToGoal = GOAL - streak;
  let countdownCopy = "";
  if (streak >= GOAL) {
    countdownCopy = "Your habit is formed. This is who you are now.";
  } else if (streak >= FIRST_UNLOCK) {
    countdownCopy = `${daysToGoal} days until your habit is formed.`;
  } else {
    countdownCopy = `You are ${FIRST_UNLOCK - streak} days away from your first unlock.`;
  }

  const progressPct = Math.min((streak / GOAL) * 100, 100);
  const unlockPct = (FIRST_UNLOCK / GOAL) * 100;

  // Ring circumference
  const r = 80;
  const circ = 2 * Math.PI * r;
  const strokeDash = (streak / GOAL) * circ;

  return (
    <div style={{ background: "#FAF9F6", minHeight: "100vh", fontFamily: DM, padding: "0 24px 40px" }}>

      {/* Header */}
      <header style={{ paddingTop: 48, marginBottom: 32 }}>
        <h1 style={{ fontFamily: DM, fontWeight: 700, fontSize: 28, color: "#1a1a1a" }}>
          Habit
        </h1>
        <p style={{ color: "#777", fontSize: 14, marginTop: 4 }}>
          Consistency is who you're becoming.
        </p>
      </header>

      {/* Streak ring */}
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
        <div style={{ position: "relative", width: 196, height: 196 }}>
          <svg width="196" height="196" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="98" cy="98" r={r}
              fill="none"
              stroke="#E0EBE5"
              strokeWidth="10"
            />
            <motion.circle
              cx="98" cy="98" r={r}
              fill="none"
              stroke="#7C9E8A"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ - strokeDash }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: DM,
                fontWeight: 800,
                fontSize: 52,
                color: "#1a1a1a",
                lineHeight: 1,
              }}
            >
              {streak}
            </span>
            <span style={{ fontSize: 13, color: "#888", marginTop: 4, fontWeight: 500 }}>
              {streak === 1 ? "day" : "days"} streak
            </span>
          </div>
        </div>

        <p style={{ color: "#999", fontSize: 14, marginTop: 16, textAlign: "center" }}>
          days toward your habit
        </p>

        {longestStreak > 0 && (
          <p style={{ color: SAGE, fontSize: 13, fontWeight: 600, marginTop: 6 }}>
            Personal best: {longestStreak} {longestStreak === 1 ? "day" : "days"}
          </p>
        )}
      </section>

      {/* 66-day progress bar */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "flex-end" }}>
          <span style={{ fontFamily: DM, fontWeight: 600, fontSize: 13, color: "#555" }}>
            66-day habit journey
          </span>
          <span style={{ fontSize: 12, color: "#999" }}>Day {streak} of {GOAL}</span>
        </div>

        <div
          style={{
            position: "relative",
            height: 12,
            background: "#E8E4DC",
            borderRadius: 100,
            overflow: "visible",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              height: "100%",
              background: SAGE,
              borderRadius: 100,
              position: "absolute",
            }}
          />
          {/* Day 30 marker */}
          <div
            style={{
              position: "absolute",
              left: `${unlockPct}%`,
              top: -2,
              bottom: -2,
              width: 2,
              background: "#B5956A",
              borderRadius: 2,
              zIndex: 2,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: `${unlockPct}%`,
            marginTop: 6,
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: `${unlockPct}%`,
              transform: "translateX(-50%)",
              fontSize: 11,
              color: "#B5956A",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            First unlock
          </span>
        </div>
      </section>

      {/* Dot grid calendar */}
      <section style={{ marginBottom: 36, marginTop: 24 }}>
        <p style={{ fontFamily: DM, fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 16 }}>
          {format(now, "MMMM yyyy")}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 10,
          }}
        >
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isPast = day < today;
            const isToday = day === today;
            const isLogged = loggedDaysThisMonth.has(day);
            const isFuture = day > today;
            const isMissed = isPast && !isLogged;

            let bg = "#EEEBE6"; // future: very light
            let border = "none";
            let dotOpacity = 1;

            if (isLogged) {
              bg = "#7C9E8A"; // logged: sage green
            } else if (isToday) {
              bg = "transparent";
              border = `2px solid #7C9E8A`; // today unlogged: sage outline
            } else if (isMissed) {
              bg = "#E0D8D0"; // missed: warm muted grey
              dotOpacity = 0.5;
            } else if (isFuture) {
              dotOpacity = 0.4;
            }

            return (
              <motion.div
                key={day}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: dotOpacity }}
                transition={{ delay: i * 0.012, duration: 0.25 }}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  background: bg,
                  border,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isToday && (
                  <span style={{ fontSize: 9, color: "#7C9E8A", fontWeight: 700 }}>
                    {day}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          <Legend color="#7C9E8A" label="Logged" />
          <Legend color="#E0D8D0" label="Missed" opacity={0.5} />
          <Legend color="#EEEBE6" label="Upcoming" opacity={0.4} />
        </div>
      </section>

      {/* Countdown copy */}
      <section>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            borderLeft: `4px solid ${SAGE}`,
            boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
            padding: "20px",
          }}
        >
          <p style={{ fontFamily: DM, fontWeight: 600, fontSize: 16, color: "#1a1a1a", lineHeight: 1.5 }}>
            {countdownCopy}
          </p>
          {streak === 0 && (
            <p style={{ color: "#999", fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
              Log your first spend today to start your streak.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Legend({ color, label, opacity }: { color: string; label: string; opacity?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: opacity ?? 1 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: "#888" }}>{label}</span>
    </div>
  );
}
