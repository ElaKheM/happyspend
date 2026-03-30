import { Router } from "express";
import bcrypt from "bcryptjs";
import { requireAuth, signToken } from "../middlewares/auth";
import {
  findUserByEmail,
  findUserById,
  createUser,
  checkAndResetStreak,
} from "../adapters/repositories/userRepository";
import { createCategory } from "../adapters/repositories/budgetRepository";

const router = Router();

function serializeUser(user: NonNullable<Awaited<ReturnType<typeof findUserById>>>) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    personaId: user.personaId,
    onboardingComplete: user.onboardingComplete,
    monthlyIncome: user.monthlyIncome != null ? Number(user.monthlyIncome) : null,
    streakCount: user.streakCount ?? 0,
    lastLoggedDate: user.lastLoggedDate ?? null,
    longestStreak: user.longestStreak ?? 0,
    createdAt: user.createdAt.toISOString(),
    spendDnaUnlocked: user.spendDnaUnlocked ?? false,
    emotionalProfile: user.emotionalProfile ?? null,
    isPremium: user.isPremium ?? false,
    premiumSince: user.premiumSince?.toISOString() ?? null,
    premiumExpires: user.premiumExpires?.toISOString() ?? null,
  };
}

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: "email, password, and name are required" });
    return;
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({ email, passwordHash, name });

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({ token, user: serializeUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const user = await findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({ token, user: serializeUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const today = new Date().toISOString().split("T")[0]!;
  await checkAndResetStreak(req.user!.userId, today);

  const user = await findUserById(req.user!.userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json(serializeUser(user));
});

router.post("/logout", requireAuth, (_req, res) => {
  res.json({ success: true, message: "Logged out" });
});

export default router;
