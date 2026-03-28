import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db, budgetReallocationsTable, budgetCategoriesTable } from "@workspace/db";

export async function createReallocation(data: {
  userId: string;
  fromCategoryId: string;
  toCategoryId: string;
  amount: number;
  weekStart: string;
  entryId?: string;
}) {
  const [row] = await db
    .insert(budgetReallocationsTable)
    .values({
      userId: data.userId,
      fromCategoryId: data.fromCategoryId,
      toCategoryId: data.toCategoryId,
      amount: String(data.amount),
      weekStart: data.weekStart,
      entryId: data.entryId ?? null,
    })
    .returning();
  return row!;
}

export async function getReallocationsByWeek(userId: string, weekStart: string, weekEnd: string) {
  return db
    .select({
      id: budgetReallocationsTable.id,
      fromCategoryId: budgetReallocationsTable.fromCategoryId,
      toCategoryId: budgetReallocationsTable.toCategoryId,
      amount: budgetReallocationsTable.amount,
      weekStart: budgetReallocationsTable.weekStart,
      entryId: budgetReallocationsTable.entryId,
      fromCategoryName: budgetCategoriesTable.name,
    })
    .from(budgetReallocationsTable)
    .leftJoin(
      budgetCategoriesTable,
      eq(budgetReallocationsTable.fromCategoryId, budgetCategoriesTable.id)
    )
    .where(
      and(
        eq(budgetReallocationsTable.userId, userId),
        gte(budgetReallocationsTable.weekStart, weekStart),
        lte(budgetReallocationsTable.weekStart, weekEnd)
      )
    );
}

export async function countAllReallocations(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(budgetReallocationsTable)
    .where(eq(budgetReallocationsTable.userId, userId));
  return row?.count ?? 0;
}

export async function countReallocationsByMonth(userId: string, monthStart: string, monthEnd: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(budgetReallocationsTable)
    .where(
      and(
        eq(budgetReallocationsTable.userId, userId),
        gte(budgetReallocationsTable.weekStart, monthStart),
        lte(budgetReallocationsTable.weekStart, monthEnd)
      )
    );
  return row?.count ?? 0;
}
