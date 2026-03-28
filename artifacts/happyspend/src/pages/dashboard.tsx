import { useGetDashboard } from "@workspace/api-client-react";
import { formatMoney } from "@/lib/utils";
import { motion } from "framer-motion";
import { LogEntryDrawer } from "@/components/log-entry-drawer";
import { CategoryIcon } from "@/components/category-icon";
import { format } from "date-fns";
import { Flame } from "lucide-react";
import { useLocation } from "wouter";

const DM = "'DM Sans', sans-serif";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]!);
}

export default function Dashboard() {
  const { data, isLoading } = useGetDashboard();
  const [, navigate] = useLocation();

  if (isLoading || !data) {
    return (
      <div className="p-6 pt-14 space-y-5 animate-pulse" style={{ background: "#FAF9F6" }}>
        <div className="h-12 bg-[#E8E4DC] rounded-2xl w-2/3" />
        <div className="h-5 bg-[#E8E4DC] rounded-full w-1/3" />
        <div className="h-3 bg-[#E8E4DC] rounded-full mt-6" />
        <div className="h-32 bg-[#E8E4DC] rounded-2xl mt-2" />
        <div className="h-20 bg-[#E8E4DC] rounded-2xl" />
        <div className="h-20 bg-[#E8E4DC] rounded-2xl" />
      </div>
    );
  }

  const { user, personaProgress, categoryStatuses, recentEntries, weeklyStats, upcomingRecurring = [] } = data as any;
  const streakCount = user.streakCount ?? 0;

  const remaining = Math.max(0, weeklyStats.totalBudgeted - weeklyStats.totalSpent);
  const isOverBudget = weeklyStats.totalBudgeted - weeklyStats.totalSpent < 0;
  const progressPct = weeklyStats.totalBudgeted > 0
    ? Math.min((weeklyStats.totalSpent / weeklyStats.totalBudgeted) * 100, 100)
    : 0;

  const weeklyIncomePercent =
    user.monthlyIncome && user.monthlyIncome > 0 && weeklyStats.totalSpent > 0
      ? Math.round((weeklyStats.totalSpent / (user.monthlyIncome / 4.33)) * 100)
      : null;

  return (
    <div className="p-6 pb-10 space-y-8" style={{ background: "#FAF9F6", fontFamily: DM, minHeight: "100vh" }}>

      {/* Header */}
      <header className="pt-10" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: DM, fontWeight: 700, fontSize: 28, color: "#1a1a1a", lineHeight: 1.2 }}>
            Hey {user.name}
          </h1>
          {personaProgress && (
            <p style={{ color: "#7C9E8A", fontWeight: 500, fontSize: 14, marginTop: 4 }}>
              {personaProgress.persona.name} · {personaProgress.stage}
            </p>
          )}
        </div>

        {/* Streak badge */}
        <button
          onClick={() => navigate("/habit")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "#7C9E8A",
            color: "#FFFFFF",
            borderRadius: 100,
            padding: "7px 14px",
            border: "none",
            cursor: "pointer",
            fontFamily: DM,
            fontWeight: 600,
            fontSize: 14,
            flexShrink: 0,
            marginTop: 4,
            boxShadow: "0 2px 10px rgba(124,158,138,0.3)",
          }}
        >
          <Flame className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span>{streakCount}</span>
          <span style={{ fontWeight: 400, fontSize: 12, opacity: 0.85 }}>{streakCount === 1 ? "day" : "days"} streak</span>
        </button>
      </header>

      {/* Journey Progress */}
      {personaProgress && (
        <section>
          <div className="flex justify-between items-center mb-2">
            <span style={{ fontFamily: DM, fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>Your Journey</span>
            <span style={{ fontFamily: DM, fontSize: 13, color: "#7C9E8A", fontWeight: 500 }}>
              {personaProgress.percentage}% to next milestone
            </span>
          </div>
          <div style={{ height: 8, background: "#E8E4DC", borderRadius: 100, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${personaProgress.percentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              style={{ height: "100%", background: "#7C9E8A", borderRadius: 100 }}
            />
          </div>
          {personaProgress.nextMilestone && (
            <p style={{ fontSize: 12, color: "#999", marginTop: 6 }}>
              Next: {personaProgress.nextMilestone.label}
            </p>
          )}
        </section>
      )}

      {/* Headline Balance Card */}
      <section>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
            padding: "24px 22px 20px",
          }}
        >
          {/* Remaining amount */}
          <div style={{ marginBottom: 2 }}>
            <span
              style={{
                fontFamily: DM,
                fontWeight: 800,
                fontSize: 48,
                color: "#1a1a1a",
                lineHeight: 1,
                letterSpacing: "-1px",
              }}
            >
              {formatMoney(remaining)}
            </span>
          </div>

          <p style={{ fontSize: 14, color: "#4A4A6A", marginBottom: 20, fontWeight: 400 }}>
            {isOverBudget ? "Adjust next week." : "left this week"}
          </p>

          {/* Progress bar */}
          <div
            style={{
              height: 5,
              background: "#F0EDE6",
              borderRadius: 100,
              overflow: "hidden",
              marginBottom: 10,
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ height: "100%", background: "#7C9E8A", borderRadius: 100 }}
            />
          </div>

          {/* Spend / budget labels */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#999" }}>
              {formatMoney(weeklyStats.totalSpent)} spent
            </span>
            <span style={{ fontSize: 12, color: "#999" }}>
              {formatMoney(weeklyStats.totalBudgeted)} budget
            </span>
          </div>

          {/* Monthly income line */}
          {weeklyIncomePercent !== null && (
            <p
              style={{
                fontSize: 13,
                color: "#888",
                marginTop: 14,
                paddingTop: 14,
                borderTop: "1px solid #F0EDE6",
              }}
            >
              That is {weeklyIncomePercent}% of your monthly income this week.
            </p>
          )}
        </div>
      </section>

      {/* Category Intentions */}
      <section>
        <h2 style={{ fontFamily: DM, fontWeight: 700, fontSize: 18, color: "#1a1a1a", marginBottom: 14 }}>
          Intentions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {categoryStatuses.map((status: any) => (
            <CategoryBar key={status.category.id} status={status} />
          ))}
          {categoryStatuses.length === 0 && (
            <p style={{ color: "#999", textAlign: "center", padding: "20px 0", fontSize: 14 }}>
              No categories set up yet.
            </p>
          )}
        </div>
      </section>

      {/* Upcoming Recurring */}
      {upcomingRecurring.length > 0 && (
        <section>
          <h2 style={{ fontFamily: DM, fontWeight: 700, fontSize: 18, color: "#1a1a1a", marginBottom: 14 }}>
            Upcoming this month
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingRecurring.map((entry: any) => (
              <div
                key={entry.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 14,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: 0.7,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "#F0EDE6",
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
                    {entry.description || entry.categoryName || "Recurring"}
                  </p>
                  <p style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                    Expected · on the {ordinal(entry.recurringDay ?? 1)}
                  </p>
                </div>
                <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 16, color: "#888" }}>
                  {formatMoney(entry.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Entries */}
      <section className="pb-4">
        <h2 style={{ fontFamily: DM, fontWeight: 700, fontSize: 18, color: "#1a1a1a", marginBottom: 14 }}>
          Recent
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recentEntries.map((entry: any) => (
            <div
              key={entry.id}
              style={{
                background: "#FFFFFF",
                borderRadius: 14,
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
                <p style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                  {format(new Date(entry.entryDate), "MMM d, h:mm a")}
                </p>
              </div>
              <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 16, color: "#1a1a1a" }}>
                {formatMoney(entry.amount)}
              </span>
            </div>
          ))}
          {recentEntries.length === 0 && (
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 14,
                padding: "28px 16px",
                textAlign: "center",
                color: "#999",
                fontSize: 14,
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              }}
            >
              No spending logged yet — log your first entry below.
            </div>
          )}
        </div>
      </section>

      <LogEntryDrawer />
    </div>
  );
}

function CategoryBar({ status }: { status: any }) {
  const { category, percentageUsed, totalSpent, weeklyBudget, message } = status;

  let borderColor = "#7C9E8A";
  let barColor = "#7C9E8A";
  let bgColor = "#EEF4F0";

  if (percentageUsed > 75 && percentageUsed <= 100) {
    borderColor = "#B5956A";
    barColor = "#B5956A";
    bgColor = "#F8F4EE";
  }
  if (percentageUsed > 100) {
    borderColor = "#8899AA";
    barColor = "#8899AA";
    bgColor = "#F0F2F5";
  }

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 14,
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
        padding: "14px 16px",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CategoryIcon name={category.icon || category.name} size={20} />
          </div>
          <span style={{ fontFamily: DM, fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>
            {category.name}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontFamily: DM, fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>
            {formatMoney(totalSpent)}
          </span>
          <span style={{ fontSize: 13, color: "#999", marginLeft: 4 }}>
            / {formatMoney(weeklyBudget)}
          </span>
        </div>
      </div>

      <div style={{ height: 6, background: "#F0EDE6", borderRadius: 100, overflow: "hidden", marginBottom: 8 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ height: "100%", background: barColor, borderRadius: 100 }}
        />
      </div>
      <p style={{ fontSize: 12, color: "#999" }}>{message}</p>
    </div>
  );
}
