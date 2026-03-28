import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { findUserById } from "../adapters/repositories/userRepository";
import { getCategoriesForUser } from "../adapters/repositories/budgetRepository";
import { getEntriesForUser } from "../adapters/repositories/entryRepository";
import { getMilestonesForUser } from "../adapters/repositories/milestoneRepository";
import { getPersonaById } from "../adapters/repositories/personaRepository";
import { getCategoryStatus } from "../domain/budget/categoryStatus";
import { calculatePersonaProgress } from "../domain/persona/personaProgress";

const router = Router();

function getWeekDateRange() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return {
    startDate: weekStart.toISOString().split("T")[0]!,
    endDate: weekEnd.toISOString().split("T")[0]!,
  };
}

function getMonthDateRange() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: monthStart.toISOString().split("T")[0]!,
    endDate: monthEnd.toISOString().split("T")[0]!,
  };
}

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user!.userId;

  const [user, categories, milestones] = await Promise.all([
    findUserById(userId),
    getCategoriesForUser(userId),
    getMilestonesForUser(userId),
  ]);

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const { startDate: weekStart, endDate: weekEnd } = getWeekDateRange();
  const { startDate: monthStart, endDate: monthEnd } = getMonthDateRange();

  const [weekEntries, monthEntries, recentEntries] = await Promise.all([
    getEntriesForUser(userId, { startDate: weekStart, endDate: weekEnd }),
    getEntriesForUser(userId, { startDate: monthStart, endDate: monthEnd }),
    getEntriesForUser(userId),
  ]);

  let persona = null;
  let personaProgress = null;

  if (user.personaId) {
    persona = await getPersonaById(user.personaId);
    if (persona) {
      const achievedKeys = milestones.map((m) => m.milestoneKey);
      personaProgress = {
        persona,
        ...calculatePersonaProgress(persona as any, achievedKeys),
      };
    }
  }

  const categoryStatuses = categories.map((cat) => {
    const spent = weekEntries
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const status = getCategoryStatus(cat, spent);
    return {
      category: {
        id: cat.id,
        userId: cat.userId,
        name: cat.name,
        monthlyBudget: Number(cat.monthlyBudget),
        colour: cat.colour,
        icon: cat.icon,
        createdAt: cat.createdAt.toISOString(),
      },
      ...status,
    };
  });

  const totalBudgeted = categories.reduce(
    (sum, c) => sum + Number(c.monthlyBudget) / 4.33,
    0
  );
  const totalSpent = weekEntries.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalSpentThisMonth = monthEntries.reduce((sum, e) => sum + Number(e.amount), 0);
  const daysLogged = new Set(weekEntries.map((e) => e.entryDate)).size;

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      personaId: user.personaId,
      onboardingComplete: user.onboardingComplete,
      monthlyIncome: user.monthlyIncome != null ? Number(user.monthlyIncome) : null,
      createdAt: user.createdAt.toISOString(),
    },
    persona,
    personaProgress,
    categoryStatuses,
    recentEntries: recentEntries.slice(0, 10).map((e) => ({
      id: e.id,
      userId: e.userId,
      categoryId: e.categoryId,
      categoryName: e.categoryName,
      categoryIcon: e.categoryIcon,
      categoryColour: e.categoryColour,
      amount: Number(e.amount),
      description: e.description,
      inputMethod: e.inputMethod,
      entryDate: e.entryDate,
      createdAt: e.createdAt.toISOString(),
    })),
    weeklyStats: {
      totalBudgeted,
      totalSpent,
      totalSpentThisMonth,
      difference: totalBudgeted - totalSpent,
      daysLogged,
      entriesLogged: weekEntries.length,
    },
  });
});

export default router;
