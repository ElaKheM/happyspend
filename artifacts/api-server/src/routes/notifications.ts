import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  upsertPushSubscription,
  deletePushSubscription,
} from "../adapters/repositories/pushSubscriptionRepository";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { findUserById } from "../adapters/repositories/userRepository";

const router = Router();

router.post("/subscribe", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { endpoint, keys } = req.body as {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ error: "Missing subscription fields" });
    return;
  }

  await upsertPushSubscription(userId, endpoint, keys.p256dh, keys.auth);
  res.json({ ok: true });
});

router.delete("/subscribe", requireAuth, async (req, res) => {
  const { endpoint } = req.body as { endpoint?: string };
  if (endpoint) await deletePushSubscription(endpoint);
  res.json({ ok: true });
});

router.get("/settings", requireAuth, async (req, res) => {
  const user = await findUserById(req.user!.userId);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  res.json({
    notificationsEnabled: user.notificationsEnabled,
    reminderTime1: user.reminderTime1,
    reminderTime2: user.reminderTime2,
    vapidPublicKey: process.env["VAPID_PUBLIC_KEY"] ?? "",
  });
});

router.patch("/settings", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { notificationsEnabled, reminderTime1, reminderTime2 } = req.body as {
    notificationsEnabled?: boolean;
    reminderTime1?: string;
    reminderTime2?: string;
  };

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (notificationsEnabled !== undefined) updates.notificationsEnabled = notificationsEnabled;
  if (reminderTime1) updates.reminderTime1 = reminderTime1;
  if (reminderTime2) updates.reminderTime2 = reminderTime2;

  if (Object.keys(updates).length > 0) {
    await db.update(usersTable).set(updates).where(eq(usersTable.id, userId));
  }

  const user = await findUserById(userId);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  res.json({
    notificationsEnabled: user.notificationsEnabled,
    reminderTime1: user.reminderTime1,
    reminderTime2: user.reminderTime2,
  });
});

export default router;
