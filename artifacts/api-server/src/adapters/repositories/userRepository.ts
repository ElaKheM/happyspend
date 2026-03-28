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

export async function saveEmotionalProfile(
  userId: string,
  profile: Record<string, number>,
) {
  await db
    .update(usersTable)
    .set({ emotionalProfile: profile })
    .where(eq(usersTable.id, userId));
}

export async function updateMonthlyIncome(userId: string, monthlyIncome: number | null) {
  await db
    .update(usersTable)
    .set({ monthlyIncome: monthlyIncome != null ? String(monthlyIncome) : null })
    .where(eq(usersTable.id, userId));
}

export async function markSpendDnaUnlocked(userId: string): Promise<void> {
  await db.update(usersTable).set({ spendDnaUnlocked: true }).where(eq(usersTable.id, userId));
}

export async function checkAndResetStreak(userId: string, today: string): Promise<void> {
  const user = await findUserById(userId);
  if (!user || !user.lastLoggedDate) return;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0]!;

  if (user.lastLoggedDate < yesterdayStr) {
    await db
      .update(usersTable)
      .set({ streakCount: 0 })
      .where(eq(usersTable.id, userId));
  }
}

export async function updateStreak(userId: string, today: string): Promise<void> {
  const user = await findUserById(userId);
  if (!user) return;

  if (user.lastLoggedDate === today) return;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0]!;

  const currentStreak = user.streakCount ?? 0;
  const newStreakCount = user.lastLoggedDate === yesterdayStr ? currentStreak + 1 : 1;
  const newLongestStreak = Math.max(user.longestStreak ?? 0, newStreakCount);

  await db
    .update(usersTable)
    .set({
      streakCount: newStreakCount,
      lastLoggedDate: today,
      longestStreak: newLongestStreak,
    })
    .where(eq(usersTable.id, userId));
}
