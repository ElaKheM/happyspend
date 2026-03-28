import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  getAllPersonas,
  getPersonaById,
} from "../adapters/repositories/personaRepository";
import { findUserById, updateUserPersona } from "../adapters/repositories/userRepository";
import { getMilestonesForUser } from "../adapters/repositories/milestoneRepository";
import { calculatePersonaProgress } from "../domain/persona/personaProgress";

const router = Router();

router.get("/", async (_req, res) => {
  const personas = await getAllPersonas();
  res.json(
    personas.map((p) => ({
      id: p.id,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      milestoneThresholds: p.milestoneThresholds,
    }))
  );
});

router.get("/progress", requireAuth, async (req, res) => {
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

  const milestones = await getMilestonesForUser(userId);
  const achievedKeys = milestones.map((m) => m.milestoneKey);
  const progress = calculatePersonaProgress(
    persona as any,
    achievedKeys
  );

  res.json({ persona, ...progress });
});

router.post("/choose", requireAuth, async (req, res) => {
  const { personaId } = req.body;
  if (!personaId) {
    res.status(400).json({ error: "personaId is required" });
    return;
  }

  const persona = await getPersonaById(personaId);
  if (!persona) {
    res.status(404).json({ error: "Persona not found" });
    return;
  }

  await updateUserPersona(req.user!.userId, personaId);
  res.json({ success: true, message: "Persona updated" });
});

export default router;
