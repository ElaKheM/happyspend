import webpush from "web-push";
import { logger } from "../lib/logger";
import { db, usersTable, budgetEntriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  getAllActiveSubscriptions,
  deletePushSubscription,
} from "../adapters/repositories/pushSubscriptionRepository";
import { getPersonalisedCopy, type EmotionalProfile } from "../domain/personalisation";

function buildMessage(
  streakCount: number,
  emotionalProfile?: EmotionalProfile | null
): string {
  // notification=2 users never receive urgency language — always the soft message
  if (emotionalProfile?.notification === 2) {
    return "Just one log. No pressure, no judgment.";
  }

  // Milestone messages — always shown regardless of profile (these are positive)
  if (streakCount >= 30) {
    return `You did it. Your habit is forming. ${streakCount} days and counting.`;
  }
  if (streakCount === 29) {
    return "Tomorrow is the day. One more log and your first unlock arrives.";
  }
  if (streakCount === 25) {
    return "You are 5 days away from unlocking your Spend DNA. You are building something most people never do.";
  }
  if (streakCount === 20) {
    return "You are 10 days away from your first unlock. Keep going.";
  }
  if (streakCount === 10) {
    return "You are 56 days away from strengthening and forming a positive habit.";
  }

  // Default daily nudge — personalised if profile matches
  return (
    getPersonalisedCopy(emotionalProfile, "push_notification_default") ??
    `Hey — anything to log from today? Your streak is at ${streakCount} days.`
  );
}

async function hasLoggedToday(userId: string, today: string): Promise<boolean> {
  const rows = await db
    .select({ id: budgetEntriesTable.id })
    .from(budgetEntriesTable)
    .where(
      and(
        eq(budgetEntriesTable.userId, userId),
        eq(budgetEntriesTable.entryDate, today),
      )
    )
    .limit(1);
  return rows.length > 0;
}

export async function sendScheduledNotifications(): Promise<void> {
  const vapidPublicKey = process.env["VAPID_PUBLIC_KEY"];
  const vapidPrivateKey = process.env["VAPID_PRIVATE_KEY"];
  const vapidSubject = process.env["VAPID_SUBJECT"] ?? "mailto:hello@happyspend.app";

  if (!vapidPublicKey || !vapidPrivateKey) return;

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const today = now.toISOString().split("T")[0]!;

  let users: typeof usersTable.$inferSelect[] = [];
  try {
    users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.notificationsEnabled, true));
  } catch (err) {
    logger.error({ err }, "Notification job: failed to fetch users");
    return;
  }

  for (const user of users) {
    if (user.reminderTime1 !== hhmm && user.reminderTime2 !== hhmm) continue;

    try {
      const alreadyLogged = await hasLoggedToday(user.id, today);
      if (alreadyLogged) continue;

      const message = buildMessage(
        user.streakCount ?? 0,
        (user.emotionalProfile as any) ?? null
      );
      const payload = JSON.stringify({ title: "HappySpend", body: message });

      const subs = await getAllActiveSubscriptions().then((all) =>
        all.filter((s) => s.userId === user.id)
      );

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dhKey, auth: sub.authKey },
            },
            payload
          );
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await deletePushSubscription(sub.endpoint);
          } else {
            logger.warn({ err, endpoint: sub.endpoint }, "Push send failed");
          }
        }
      }
    } catch (err) {
      logger.error({ err, userId: user.id }, "Notification job: error for user");
    }
  }
}

export function scheduleNotifications(): void {
  setInterval(() => {
    sendScheduledNotifications().catch((err) => {
      logger.error({ err }, "Notification scheduler error");
    });
  }, 60_000);
}
