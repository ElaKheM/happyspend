import { and, eq } from "drizzle-orm";
import { db, budgetCategoriesTable } from "@workspace/db";

export async function getCategoriesForUser(userId: string) {
  return db
    .select()
    .from(budgetCategoriesTable)
    .where(eq(budgetCategoriesTable.userId, userId));
}

export async function createCategory(data: {
  userId: string;
  name: string;
  monthlyBudget: number;
  colour: string;
  icon: string;
}) {
  const [cat] = await db
    .insert(budgetCategoriesTable)
    .values({
      userId: data.userId,
      name: data.name,
      monthlyBudget: String(data.monthlyBudget),
      colour: data.colour,
      icon: data.icon,
    })
    .returning();
  return cat!;
}

export async function updateCategory(
  id: string,
  userId: string,
  data: {
    name?: string | null;
    monthlyBudget?: number | null;
    colour?: string | null;
    icon?: string | null;
  }
) {
  const update: Record<string, unknown> = {};
  if (data.name != null) update.name = data.name;
  if (data.monthlyBudget != null) update.monthlyBudget = String(data.monthlyBudget);
  if (data.colour != null) update.colour = data.colour;
  if (data.icon != null) update.icon = data.icon;

  const [cat] = await db
    .update(budgetCategoriesTable)
    .set(update)
    .where(and(eq(budgetCategoriesTable.id, id), eq(budgetCategoriesTable.userId, userId)))
    .returning();
  return cat ?? null;
}

export async function deleteCategory(id: string, userId: string) {
  await db
    .delete(budgetCategoriesTable)
    .where(and(eq(budgetCategoriesTable.id, id), eq(budgetCategoriesTable.userId, userId)));
}
