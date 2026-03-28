import { eq } from "drizzle-orm";
import { db, milestonesTable } from "@workspace/db";

export async function getMilestonesForUser(userId: string) {
  return db
    .select()
    .from(milestonesTable)
    .where(eq(milestonesTable.userId, userId));
}

export async function saveMilestones(userId: string, milestoneKeys: string[]) {
  if (milestoneKeys.length === 0) return;
  await db.insert(milestonesTable).values(
    milestoneKeys.map((key) => ({ userId, milestoneKey: key }))
  );
}
