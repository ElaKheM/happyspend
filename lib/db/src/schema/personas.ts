import { pgTable, text, jsonb } from "drizzle-orm/pg-core";

export const personasTable = pgTable("personas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  milestoneThresholds: jsonb("milestone_thresholds").notNull().$type<Array<{key: string; label: string; description: string}>>(),
});

export type Persona = typeof personasTable.$inferSelect;
