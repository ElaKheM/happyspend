import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { getMilestonesForUser } from "../adapters/repositories/milestoneRepository";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const milestones = await getMilestonesForUser(req.user!.userId);
  res.json(
    milestones.map((m) => ({
      id: m.id,
      userId: m.userId,
      milestoneKey: m.milestoneKey,
      achievedAt: m.achievedAt.toISOString(),
    }))
  );
});

export default router;
