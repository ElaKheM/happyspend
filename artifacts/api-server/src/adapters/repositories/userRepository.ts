import { eq } from "drizzle-orm";
import { db, usersTable, type InsertUser } from "@workspace/db";

export async function findUserByEmail(email: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  return user ?? null;
}

export async function findUserById(id: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  return user ?? null;
}

export async function createUser(data: InsertUser) {
  const [user] = await db.insert(usersTable).values(data).returning();
  return user!;
}

export async function updateUserPersona(userId: string, personaId: string) {
  await db.update(usersTable).set({ personaId }).where(eq(usersTable.id, userId));
}

export async function setOnboardingComplete(
  userId: string,
  personaId: string,
  monthlyIncome?: number | null,
) {
  await db
    .update(usersTable)
    .set({
      onboardingComplete: true,
      personaId,
      ...(monthlyIncome != null ? { monthlyIncome: String(monthlyIncome) } : {}),
    })
    .where(eq(usersTable.id, userId));
}

export async function updateMonthlyIncome(userId: string, monthlyIncome: number | null) {
  await db
    .update(usersTable)
    .set({ monthlyIncome: monthlyIncome != null ? String(monthlyIncome) : null })
    .where(eq(usersTable.id, userId));
}
