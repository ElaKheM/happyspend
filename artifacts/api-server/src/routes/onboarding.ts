import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { setOnboardingComplete, updateUserPersona } from "../adapters/repositories/userRepository";
import { createCategory } from "../adapters/repositories/budgetRepository";

const router = Router();

router.post("/complete", requireAuth, async (req, res) => {
  const { personaId, categories, monthlyIncome } = req.body;
  const userId = req.user!.userId;

  if (!personaId || !Array.isArray(categories) || categories.length === 0) {
    res.status(400).json({ error: "personaId and at least one category are required" });
    return;
  }

  const income = monthlyIncome != null ? Number(monthlyIncome) : null;
  await setOnboardingComplete(userId, personaId, income);

  for (const cat of categories) {
    if (cat.name && cat.monthlyBudget != null && cat.colour && cat.icon) {
      await createCategory({
        userId,
        name: cat.name,
        monthlyBudget: Number(cat.monthlyBudget),
        colour: cat.colour,
        icon: cat.icon,
      });
    }
  }

  res.json({ success: true, message: "Onboarding complete" });
});

export default router;
