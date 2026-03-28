interface Entry {
  entryDate: string;
  description: string | null;
  categoryId: string;
  amount: string;
}

interface Category {
  id: string;
  name: string;
  monthlyBudget: string;
}

interface WeeklySpend {
  [categoryId: string]: number;
}

function getWeeklyBudget(monthlyBudget: number): number {
  return monthlyBudget / 4.33;
}

function getWeeklySpendByCategory(entries: Entry[]): WeeklySpend {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const spend: WeeklySpend = {};
  for (const entry of entries) {
    const d = new Date(entry.entryDate);
    if (d >= weekStart) {
      spend[entry.categoryId] = (spend[entry.categoryId] ?? 0) + Number(entry.amount);
    }
  }
  return spend;
}

export function checkNewMilestones(
  personaId: string,
  entries: Entry[],
  categories: Category[],
  existingMilestoneKeys: string[]
): string[] {
  const newMilestones: string[] = [];

  function check(key: string, condition: boolean) {
    if (condition && !existingMilestoneKeys.includes(key)) {
      newMilestones.push(key);
    }
  }

  const daysWithEntries = new Set(entries.map((e) => e.entryDate));
  const weeklySpend = getWeeklySpendByCategory(entries);

  if (personaId === "steady-builder") {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d.toISOString().split("T")[0];
    });
    const consecutive = last7Days.every((d) => daysWithEntries.has(d));
    check("steady_builder_7_days", consecutive);

    const underBudgetCategories = categories.filter((c) => {
      const wb = getWeeklyBudget(Number(c.monthlyBudget));
      return (weeklySpend[c.id] ?? 0) <= wb;
    });
    check("steady_builder_3_categories_under", underBudgetCategories.length >= 3);
  }

  if (personaId === "intentional-spender") {
    check("intentional_5_categories", categories.length >= 5);
    const entriesWithDescription = entries.filter((e) => e.description && e.description.trim().length > 0);
    check("intentional_20_described", entriesWithDescription.length >= 20);
  }

  if (personaId === "freedom-seeker") {
    const savingsCategory = categories.find((c) =>
      c.name.toLowerCase().includes("sav") ||
      c.name.toLowerCase().includes("goal")
    );
    check("freedom_savings_category", !!savingsCategory);
  }

  if (personaId === "debt-slayer") {
    const debtCategory = categories.find((c) =>
      c.name.toLowerCase().includes("debt") ||
      c.name.toLowerCase().includes("repay") ||
      c.name.toLowerCase().includes("loan")
    );
    check("debt_slayer_debt_category", !!debtCategory);
  }

  return newMilestones;
}
