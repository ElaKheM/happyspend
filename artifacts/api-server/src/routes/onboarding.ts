import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { setOnboardingComplete } from "../adapters/repositories/userRepository";
import { createCategory } from "../adapters/repositories/budgetRepository";
import { updateUserPersona } from "../adapters/repositories/userRepository";

const router = Router();

router.post("/complete", requireAuth, async (req, res) => {
  const { personaId, categories } = req.body;
  const userId = req.user!.userId;

  if (!personaId || !Array.isArray(categories) || categories.length === 0) {
    res.status(400).json({ error: "personaId and at least one category are required" });
    return;
  }

  await setOnboardingComplete(userId, personaId);

  for (const cat of categories) {
    if (cat.name && cat.monthlyBudget && cat.colour && cat.icon) {
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
