import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createReallocation,
  countAllReallocations,
  countReallocationsByMonth,
} from "../adapters/repositories/reallocationRepository";
import {
  getCategoriesForUser,
} from "../adapters/repositories/budgetRepository";
import { getEntriesForUser } from "../adapters/repositories/entryRepository";
import { getMilestonesForUser, saveMilestones } from "../adapters/repositories/milestoneRepository";
import { findUserById } from "../adapters/repositories/userRepository";

const router = Router();

const PERSONA_REALLOCATION_MESSAGES: Record<string, string> = {
  "The Steady Builder":
    "Adjusted. That's exactly what steady looks like — not perfect spending, but clear decisions. You're in control.",
  "The Intentional Spender":
    "You just did something most people never do. You noticed, you decided, you moved on. That's what intentional means.",
  "The Freedom Seeker":
    "Covered. Budget balanced. Every deliberate choice like this is a step toward the freedom you're building toward.",
  "The Debt Slayer":
    "Reallocated. Ship steered. Keep an eye on {from} — you'll want to steer more closely next week.",
};

function getWeekBounds(weekStart: string): { weekStart: string; weekEnd: string } {
  const d = new Date(weekStart + "T12:00:00Z");
  const end = new Date(d);
  end.setUTCDate(d.getUTCDate() + 6);
  return { weekStart, weekEnd: end.toISOString().split("T")[0]! };
}

function getMonthBounds(date: Date): { monthStart: string; monthEnd: string } {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const start = new Date(Date.UTC(y, m, 1));
  const end = new Date(Date.UTC(y, m + 1, 0));
  return {
    monthStart: start.toISOString().split("T")[0]!,
    monthEnd: end.toISOString().split("T")[0]!,
  };
}

router.post("/", requireAuth, async (req, res) => {
  const { fromCategoryId, toCategoryId, amount, weekStart, entryId } = req.body;
  const userId = req.user!.userId;

  if (!fromCategoryId || !toCategoryId || !amount || !weekStart) {
    res.status(400).json({ error: "fromCategoryId, toCategoryId, amount, weekStart required" });
    return;
  }

  const reallocation = await createReallocation({
    userId,
    fromCategoryId,
    toCategoryId,
    amount: Number(amount),
    weekStart,
    entryId: entryId ?? undefined,
  });

  // ── Milestone checks ──────────────────────────────────────────
  const existingMilestones = await getMilestonesForUser(userId);
  const existingKeys = existingMilestones.map((m) => m.milestoneKey);
  const newMilestoneKeys: string[] = [];

  function check(key: string, condition: boolean) {
    if (condition && !existingKeys.includes(key)) newMilestoneKeys.push(key);
  }

  const totalReallocations = await countAllReallocations(userId);
  check("first_adjustment", totalReallocations === 1);

  const { monthStart, monthEnd } = getMonthBounds(new Date());
  const monthCount = await countReallocationsByMonth(userId, monthStart, monthEnd);
  check("the_adjuster", monthCount >= 3);

  // balanced: total spend this week <= total weekly budgeted
  const { weekEnd } = getWeekBounds(weekStart);
  const [weekEntries, categories] = await Promise.all([
    getEntriesForUser(userId, { startDate: weekStart, endDate: weekEnd }),
    getCategoriesForUser(userId),
  ]);
  const totalSpent = weekEntries.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalBudgeted = categories.reduce((sum, c) => sum + Number(c.monthlyBudget) / 4.33, 0);
  check("balanced", totalSpent <= totalBudgeted);

  if (newMilestoneKeys.length > 0) {
    await saveMilestones(userId, newMilestoneKeys);
  }

  // ── Persona celebration message ────────────────────────────────
  const fromCat = categories.find((c) => c.id === fromCategoryId);
  const fromCatName = fromCat?.name ?? "that category";

  // fetch persona name from user record
  const userRecord = await findUserById(userId);
  const personaName = userRecord?.personaId
    ? {
        "steady-builder": "The Steady Builder",
        "intentional-spender": "The Intentional Spender",
        "freedom-seeker": "The Freedom Seeker",
        "debt-slayer": "The Debt Slayer",
      }[userRecord.personaId] ?? ""
    : "";

  let celebrationMessage =
    PERSONA_REALLOCATION_MESSAGES[personaName] ??
    "Adjusted. You noticed and you acted — that's the move.";

  celebrationMessage = celebrationMessage.replace("{from}", fromCatName);

  res.status(201).json({
    reallocation,
    newMilestones: newMilestoneKeys,
    celebrationMessage,
  });
});

export default router;
