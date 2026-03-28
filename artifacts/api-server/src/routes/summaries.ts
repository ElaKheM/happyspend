import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { findUserById } from "../adapters/repositories/userRepository";
import { getCategoriesForUser } from "../adapters/repositories/budgetRepository";
import { getEntriesForUser } from "../adapters/repositories/entryRepository";
import { getMilestonesForUser, saveMilestones } from "../adapters/repositories/milestoneRepository";
import { getPersonaById } from "../adapters/repositories/personaRepository";
import { generateWeeklySummary } from "../domain/budget/weeklySummary";
import { getReallocationsByWeek } from "../adapters/repositories/reallocationRepository";

const router = Router();

function getWeekRange() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return {
    weekStart: weekStart.toISOString().split("T")[0]!,
    weekEnd: weekEnd.toISOString().split("T")[0]!,
  };
}

router.get("/weekly", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const user = await findUserById(userId);

  if (!user || !user.personaId) {
    res.status(404).json({ error: "No persona chosen yet" });
    return;
  }

  const persona = await getPersonaById(user.personaId);
  if (!persona) {
    res.status(404).json({ error: "Persona not found" });
    return;
  }

  const { weekStart, weekEnd } = getWeekRange();
  const [categories, entries, milestones, reallocations] = await Promise.all([
    getCategoriesForUser(userId),
    getEntriesForUser(userId, { startDate: weekStart, endDate: weekEnd }),
    getMilestonesForUser(userId),
    getReallocationsByWeek(userId, weekStart, weekEnd),
  ]);

  const achievedKeys = milestones.map((m) => m.milestoneKey);
  const summary = generateWeeklySummary(
    persona as any,
    entries as any,
    categories as any,
    achievedKeys,
    weekStart,
    weekEnd,
    (user.emotionalProfile as any) ?? null,
    reallocations.map((r) => ({
      fromCategoryId: r.fromCategoryId,
      fromCategoryName: r.fromCategoryName ?? null,
    }))
  );

  if (summary.newMilestones.length > 0) {
    await saveMilestones(userId, summary.newMilestones);
  }

  res.json(summary);
});

export default router;
