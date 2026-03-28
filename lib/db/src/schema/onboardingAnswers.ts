import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const onboardingAnswersTable = pgTable("onboarding_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id).notNull(),
  questionKey: text("question_key").notNull(),
  answerIndex: integer("answer_index").notNull(),
  answeredAt: timestamp("answered_at", { withTimezone: true }).defaultNow().notNull(),
});

export type OnboardingAnswer = typeof onboardingAnswersTable.$inferSelect;
