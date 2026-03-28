import { eq } from "drizzle-orm";
import { db, pushSubscriptionsTable } from "@workspace/db";

export async function upsertPushSubscription(
  userId: string,
  endpoint: string,
  p256dhKey: string,
  authKey: string,
): Promise<void> {
  await db
    .insert(pushSubscriptionsTable)
    .values({ userId, endpoint, p256dhKey, authKey })
    .onConflictDoUpdate({
      target: pushSubscriptionsTable.endpoint,
      set: { userId, p256dhKey, authKey },
    });
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  await db
    .delete(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.endpoint, endpoint));
}

export async function getAllSubscriptionsForUser(userId: string) {
  return db
    .select()
    .from(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.userId, userId));
}

export async function getAllActiveSubscriptions() {
  return db.select().from(pushSubscriptionsTable);
}
