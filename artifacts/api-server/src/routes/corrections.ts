import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createCorrection,
  getCorrectionsForUser,
} from "../adapters/repositories/correctionsRepository";

const router = Router();

router.get("/corrections", requireAuth, async (req, res) => {
  try {
    const corrections = await getCorrectionsForUser(req.user!.userId);
    res.json(corrections);
  } catch (err) {
    console.error("GET /corrections error:", err);
    res.status(500).json({ error: "Failed to fetch corrections" });
  }
});

router.post("/corrections", requireAuth, async (req, res) => {
  const { descriptionKeyword, suggestedCategoryId, chosenCategoryId } = req.body;

  if (!descriptionKeyword || !suggestedCategoryId || !chosenCategoryId) {
    return res.status(400).json({ error: "descriptionKeyword, suggestedCategoryId and chosenCategoryId are required" });
  }

  try {
    const correction = await createCorrection({
      userId: req.user!.userId,
      descriptionKeyword: String(descriptionKeyword).toLowerCase().trim(),
      suggestedCategoryId,
      chosenCategoryId,
    });
    res.status(201).json(correction);
  } catch (err) {
    console.error("POST /corrections error:", err);
    res.status(500).json({ error: "Failed to save correction" });
  }
});

export default router;
