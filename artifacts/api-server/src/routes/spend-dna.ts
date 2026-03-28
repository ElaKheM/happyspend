import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  findUserById,
  markSpendDnaUnlocked,
} from "../adapters/repositories/userRepository";
import { getEntriesForUser } from "../adapters/repositories/entryRepository";
import { getPersonaById } from "../adapters/repositories/personaRepository";

const router = Router();

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour <= 11) return "morning";
  if (hour >= 12 && hour <= 16) return "afternoon";
  if (hour >= 17 && hour <= 21) return "evening";
  return "night";
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0]!;
}

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const user = await findUserById(userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const persona = user.personaId ? await getPersonaById(user.personaId) : null;

  const now = new Date();
  const endDate = now.toISOString().split("T")[0]!;
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split("T")[0]!;
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [last30Entries, monthEntries] = await Promise.all([
    getEntriesForUser(userId, { startDate, endDate }),
    getEntriesForUser(userId, { startDate: monthStart, endDate }),
  ]);

  // Stats
  const totalEntriesThisMonth = monthEntries.length;

  // Top category by spend in last 30 days
  const categorySpend: Record<string, { name: string; total: number }> = {};
  for (const entry of last30Entries) {
    const key = entry.categoryId ?? "__unknown";
    if (!categorySpend[key]) {
      categorySpend[key] = { name: entry.categoryName ?? "Uncategorized", total: 0 };
    }
    categorySpend[key]!.total += Number(entry.amount);
  }
  const sortedCategories = Object.entries(categorySpend).sort((a, b) => b[1].total - a[1].total);
  const topCategoryEntry = sortedCategories[0];
  const topCategoryId = topCategoryEntry?.[0];
  const topCategoryName = topCategoryEntry?.[1].name ?? "Uncategorized";

  // Insight 1: peak hour of day from createdAt
  const hourCounts: Record<number, number> = {};
  for (const entry of last30Entries) {
    const hour = new Date(entry.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
  }
  const peakHourStr = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "12";
  const logTimeOfDay = getTimeOfDay(parseInt(peakHourStr, 10));

  // Insight 2: day of week with highest spend in top category
  let topCategoryDayPercent: { percent: number; categoryName: string; dayName: string } | null = null;
  if (topCategoryId && topCategoryId !== "__unknown") {
    const topCatEntries = last30Entries.filter(e => e.categoryId === topCategoryId);
    const daySpend: Record<number, number> = {};
    let topCatTotal = 0;
    for (const entry of topCatEntries) {
      const day = new Date(entry.entryDate + "T12:00:00Z").getUTCDay();
      daySpend[day] = (daySpend[day] ?? 0) + Number(entry.amount);
      topCatTotal += Number(entry.amount);
    }
    const peakDayEntry = Object.entries(daySpend).sort((a, b) => b[1] - a[1])[0];
    if (peakDayEntry && topCatTotal > 0) {
      const peakDayIndex = parseInt(peakDayEntry[0], 10);
      const percent = Math.round((Number(peakDayEntry[1]) / topCatTotal) * 100);
      topCategoryDayPercent = {
        percent,
        categoryName: topCategoryName,
        dayName: DAY_NAMES[peakDayIndex] ?? "Saturday",
      };
    }
  }

  // Insight 3: week 1 vs week 4 average daily spend
  const week1EndStr = addDays(startDate, 7);
  const week4StartStr = addDays(startDate, 21);

  const week1Entries = last30Entries.filter(
    e => e.entryDate >= startDate && e.entryDate < week1EndStr
  );
  const week4Entries = last30Entries.filter(
    e => e.entryDate >= week4StartStr
  );

  const week1Total = week1Entries.reduce((s, e) => s + Number(e.amount), 0);
  const week4Total = week4Entries.reduce((s, e) => s + Number(e.amount), 0);
  const week1Avg = week1Total / 7;
  const week4Avg = week4Total / 9;
  const diff = Math.round(Math.abs(week4Avg - week1Avg));

  const weeklyTrend = {
    direction: (week4Avg < week1Avg ? "decreased" : "increased") as "decreased" | "increased",
    amount: diff,
    message:
      week4Avg < week1Avg
        ? "You're trending in the right direction."
        : "Worth watching next month.",
  };

  res.json({
    user: {
      name: user.name,
      personaName: persona?.name ?? null,
      emotionalProfile: user.emotionalProfile ?? null,
      streakCount: user.streakCount ?? 0,
      spendDnaUnlocked: user.spendDnaUnlocked ?? false,
    },
    stats: {
      streakCount: user.streakCount ?? 0,
      totalEntriesThisMonth,
      topCategoryName,
    },
    insights: {
      logTimeOfDay,
      topCategoryDayPercent,
      weeklyTrend,
    },
  });
});

router.post("/unlock", requireAuth, async (req, res) => {
  await markSpendDnaUnlocked(req.user!.userId);
  res.json({ success: true });
});

export default router;
