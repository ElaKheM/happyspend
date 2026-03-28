import { db, onboardingAnswersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function saveOnboardingAnswer(input: {
  userId: string;
  questionKey: string;
  answerIndex: number;
}) {
  const [row] = await db
    .insert(onboardingAnswersTable)
    .values(input)
    .returning();
  return row;
}

export async function getOnboardingAnswers(userId: string) {
  return db
    .select()
    .from(onboardingAnswersTable)
    .where(eq(onboardingAnswersTable.userId, userId));
}
