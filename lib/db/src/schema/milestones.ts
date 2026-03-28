import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const milestonesTable = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id).notNull(),
  milestoneKey: text("milestone_key").notNull(),
  achievedAt: timestamp("achieved_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Milestone = typeof milestonesTable.$inferSelect;
