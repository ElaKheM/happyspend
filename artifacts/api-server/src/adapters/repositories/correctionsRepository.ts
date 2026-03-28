import { db, categoryCorrectionsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";

export interface CreateCorrectionInput {
  userId: string;
  descriptionKeyword: string;
  suggestedCategoryId: string;
  chosenCategoryId: string;
}

export async function createCorrection(input: CreateCorrectionInput) {
  const [row] = await db
    .insert(categoryCorrectionsTable)
    .values(input)
    .returning();
  return row;
}

export async function getCorrectionsForUser(userId: string) {
  return db
    .select()
    .from(categoryCorrectionsTable)
    .where(eq(categoryCorrectionsTable.userId, userId))
    .orderBy(categoryCorrectionsTable.createdAt);
}
