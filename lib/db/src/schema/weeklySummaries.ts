import { pgTable, date, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const weeklySummariesTable = pgTable("weekly_summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id).notNull(),
  weekStart: date("week_start").notNull(),
  weekEnd: date("week_end").notNull(),
  summaryData: jsonb("summary_data").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type WeeklySummary = typeof weeklySummariesTable.$inferSelect;
