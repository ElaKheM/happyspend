import { pgTable, text, numeric, date, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { budgetCategoriesTable } from "./budgetCategories";

export const budgetEntriesTable = pgTable("budget_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id).notNull(),
  categoryId: uuid("category_id").references(() => budgetCategoriesTable.id).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  inputMethod: text("input_method").notNull(),
  entryDate: date("entry_date").notNull().default("now()"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertBudgetEntrySchema = createInsertSchema(budgetEntriesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertBudgetEntry = z.infer<typeof insertBudgetEntrySchema>;
export type BudgetEntry = typeof budgetEntriesTable.$inferSelect;
