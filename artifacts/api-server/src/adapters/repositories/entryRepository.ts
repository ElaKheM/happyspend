import { and, eq, gte, lte, desc } from "drizzle-orm";
import { db, budgetEntriesTable, budgetCategoriesTable } from "@workspace/db";

export async function getEntriesForUser(
  userId: string,
  opts?: { startDate?: string; endDate?: string; categoryId?: string }
) {
  const conditions = [eq(budgetEntriesTable.userId, userId)];

  if (opts?.startDate) {
    conditions.push(gte(budgetEntriesTable.entryDate, opts.startDate));
  }
  if (opts?.endDate) {
    conditions.push(lte(budgetEntriesTable.entryDate, opts.endDate));
  }
  if (opts?.categoryId) {
    conditions.push(eq(budgetEntriesTable.categoryId, opts.categoryId));
  }

  const rows = await db
    .select({
      id: budgetEntriesTable.id,
      userId: budgetEntriesTable.userId,
      categoryId: budgetEntriesTable.categoryId,
      categoryName: budgetCategoriesTable.name,
      categoryIcon: budgetCategoriesTable.icon,
      categoryColour: budgetCategoriesTable.colour,
      amount: budgetEntriesTable.amount,
      description: budgetEntriesTable.description,
      inputMethod: budgetEntriesTable.inputMethod,
      entryDate: budgetEntriesTable.entryDate,
      createdAt: budgetEntriesTable.createdAt,
    })
    .from(budgetEntriesTable)
    .leftJoin(
      budgetCategoriesTable,
      eq(budgetEntriesTable.categoryId, budgetCategoriesTable.id)
    )
    .where(and(...conditions))
    .orderBy(desc(budgetEntriesTable.entryDate), desc(budgetEntriesTable.createdAt));

  return rows;
}

export async function createEntry(data: {
  userId: string;
  categoryId: string;
  amount: number;
  description: string | null;
  inputMethod: string;
  entryDate: string;
}) {
  const [entry] = await db
    .insert(budgetEntriesTable)
    .values({
      userId: data.userId,
      categoryId: data.categoryId,
      amount: String(data.amount),
      description: data.description,
      inputMethod: data.inputMethod,
      entryDate: data.entryDate,
    })
    .returning();
  return entry!;
}

export async function deleteEntry(id: string, userId: string) {
  await db
    .delete(budgetEntriesTable)
    .where(and(eq(budgetEntriesTable.id, id), eq(budgetEntriesTable.userId, userId)));
}
