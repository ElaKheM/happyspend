import { pgTable, numeric, date, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { budgetCategoriesTable } from "./budgetCategories";
import { budgetEntriesTable } from "./budgetEntries";

export const budgetReallocationsTable = pgTable("budget_reallocations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id).notNull(),
  fromCategoryId: uuid("from_category_id").references(() => budgetCategoriesTable.id).notNull(),
  toCategoryId: uuid("to_category_id").references(() => budgetCategoriesTable.id).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  weekStart: date("week_start").notNull(),
  entryId: uuid("entry_id").references(() => budgetEntriesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type BudgetReallocation = typeof budgetReallocationsTable.$inferSelect;
