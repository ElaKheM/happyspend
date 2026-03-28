interface Category {
  id: string;
  name: string;
  monthlyBudget: string | number;
  colour: string;
  icon: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getCategoryStatus(category: Category, totalSpent: number) {
  const budget = Number(category.monthlyBudget);
  const weeklyBudget = budget / 4.33;
  const remaining = weeklyBudget - totalSpent;
  const percentageUsed = weeklyBudget === 0 ? 0 : (totalSpent / weeklyBudget) * 100;

  if (percentageUsed <= 75) {
    return {
      status: "on-track" as const,
      message: "On track",
      colour: "green",
      reframe: null,
      weeklyBudget,
      remaining,
      percentageUsed,
      totalSpent,
    };
  } else if (percentageUsed <= 100) {
    return {
      status: "heads-up" as const,
      message: "Heads up",
      colour: "amber",
      reframe: null,
      weeklyBudget,
      remaining,
      percentageUsed,
      totalSpent,
    };
  } else {
    const overspendAmount = Math.abs(remaining);
    return {
      status: "over" as const,
      message: `${formatCurrency(overspendAmount)} more than planned this week`,
      colour: "slate",
      reframe: "That's useful to know. You can adjust next week.",
      weeklyBudget,
      remaining,
      percentageUsed,
      totalSpent,
    };
  }
}
