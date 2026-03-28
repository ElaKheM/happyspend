import { Router } from "express";
import bcrypt from "bcryptjs";
import { requireAuth, signToken } from "../middlewares/auth";
import {
  findUserByEmail,
  findUserById,
  createUser,
  setOnboardingComplete,
} from "../adapters/repositories/userRepository";
import { createCategory } from "../adapters/repositories/budgetRepository";

const router = Router();

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
  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      personaId: user.personaId,
      onboardingComplete: user.onboardingComplete,
      createdAt: user.createdAt.toISOString(),
    },
  });
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
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      personaId: user.personaId,
      onboardingComplete: user.onboardingComplete,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await findUserById(req.user!.userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    personaId: user.personaId,
    onboardingComplete: user.onboardingComplete,
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/logout", requireAuth, (_req, res) => {
  res.json({ success: true, message: "Logged out" });
});

export default router;
