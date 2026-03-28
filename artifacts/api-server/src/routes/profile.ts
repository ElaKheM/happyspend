import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { findUserById, updateMonthlyIncome } from "../adapters/repositories/userRepository";

const router = Router();

router.patch("/", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { monthlyIncome } = req.body;

  const income = monthlyIncome != null ? Number(monthlyIncome) : null;
  await updateMonthlyIncome(userId, income);

  const user = await findUserById(userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    personaId: user.personaId,
    onboardingComplete: user.onboardingComplete,
    monthlyIncome: user.monthlyIncome != null ? Number(user.monthlyIncome) : null,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
