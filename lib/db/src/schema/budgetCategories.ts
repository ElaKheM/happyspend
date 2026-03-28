import { pgTable, text, numeric, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const budgetCategoriesTable = pgTable("budget_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id).notNull(),
  name: text("name").notNull(),
  monthlyBudget: numeric("monthly_budget", { precision: 12, scale: 2 }).notNull(),
  colour: text("colour").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertBudgetCategorySchema = createInsertSchema(budgetCategoriesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type BudgetCategory = typeof budgetCategoriesTable.$inferSelect;
