import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { setOnboardingComplete, updateUserPersona, saveEmotionalProfile } from "../adapters/repositories/userRepository";
import { createCategory } from "../adapters/repositories/budgetRepository";
import { saveOnboardingAnswer } from "../adapters/repositories/onboardingAnswersRepository";

const router = Router();

router.post("/answer", requireAuth, async (req, res) => {
  const { questionKey, answerIndex } = req.body;
  const userId = req.user!.userId;

  if (!questionKey || answerIndex == null) {
    return res.status(400).json({ error: "questionKey and answerIndex are required" });
  }

  try {
    const answer = await saveOnboardingAnswer({
      userId,
      questionKey: String(questionKey),
      answerIndex: Number(answerIndex),
    });
    res.status(201).json(answer);
  } catch (err) {
    console.error("POST /onboarding/answer error:", err);
    res.status(500).json({ error: "Failed to save answer" });
  }
});

router.post("/emotional-profile", requireAuth, async (req, res) => {
  const { profile } = req.body;
  const userId = req.user!.userId;

  if (!profile || typeof profile !== "object") {
    return res.status(400).json({ error: "profile object is required" });
  }

  try {
    await saveEmotionalProfile(userId, profile);
    res.json({ success: true });
  } catch (err) {
    console.error("POST /onboarding/emotional-profile error:", err);
    res.status(500).json({ error: "Failed to save emotional profile" });
  }
});

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
