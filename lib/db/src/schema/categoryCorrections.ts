import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { budgetCategoriesTable } from "./budgetCategories";

export const categoryCorrectionsTable = pgTable("category_corrections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id).notNull(),
  descriptionKeyword: text("description_keyword").notNull(),
  suggestedCategoryId: uuid("suggested_category_id").references(() => budgetCategoriesTable.id).notNull(),
  chosenCategoryId: uuid("chosen_category_id").references(() => budgetCategoriesTable.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CategoryCorrection = typeof categoryCorrectionsTable.$inferSelect;
