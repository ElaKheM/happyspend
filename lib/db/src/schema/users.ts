import { pgTable, text, boolean, timestamp, uuid, numeric, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  personaId: text("persona_id"),
  onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
  monthlyIncome: numeric("monthly_income", { precision: 12, scale: 2 }),
  streakCount: integer("streak_count").notNull().default(0),
  lastLoggedDate: date("last_logged_date"),
  longestStreak: integer("longest_streak").notNull().default(0),
  notificationsEnabled: boolean("notifications_enabled").default(false).notNull(),
  reminderTime1: text("reminder_time_1").default("12:30").notNull(),
  reminderTime2: text("reminder_time_2").default("19:00").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
