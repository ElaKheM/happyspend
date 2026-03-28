import { eq } from "drizzle-orm";
import { db, personasTable } from "@workspace/db";

export const PERSONAS = [
  {
    id: "steady-builder",
    name: "The Steady Builder",
    tagline: "Calm, consistent, no drama.",
    description:
      "You know where every rand goes — not because you're obsessive, but because clarity is your baseline. You're building something solid, one week at a time.",
    milestoneThresholds: [
      {
        key: "steady_builder_7_days",
        label: "7 consecutive days logged",
        description: "Log your spending for 7 consecutive days",
      },
      {
        key: "steady_builder_3_categories_under",
        label: "3 categories under budget",
        description: "Stay within budget in 3 categories in one week",
      },
      {
        key: "steady_builder_4_summaries",
        label: "4 weekly summaries completed",
        description: "Complete 4 weekly summaries",
      },
      {
        key: "steady_builder_under_budget_month",
        label: "Under budget for a month",
        description: "Stay under overall budget for a full month",
      },
    ],
  },
  {
    id: "intentional-spender",
    name: "The Intentional Spender",
    tagline: "Live fully. Spend deliberately.",
    description:
      "You spend on what genuinely matters and cut what doesn't — without guilt either way. Every transaction is a choice, not an accident.",
    milestoneThresholds: [
      {
        key: "intentional_5_categories",
        label: "5 budget categories created",
        description: "Create at least 5 budget categories",
      },
      {
        key: "intentional_20_described",
        label: "20 described entries",
        description: "Log 20 entries with descriptions",
      },
      {
        key: "intentional_adjusted_category",
        label: "Category adjusted from patterns",
        description: "Adjust a budget category based on actual spend patterns",
      },
      {
        key: "intentional_fully_described_week",
        label: "Fully described week",
        description: "Have a week where every logged entry has a description",
      },
    ],
  },
  {
    id: "freedom-seeker",
    name: "The Freedom Seeker",
    tagline: "Budgeting is the price of the life you want.",
    description:
      "You're not interested in budgeting for its own sake. You're interested in what control over money unlocks: travel, time, options. Every week under budget is a week closer to that.",
    milestoneThresholds: [
      {
        key: "freedom_savings_category",
        label: "Savings or goal category set",
        description: "Set a savings or goal category",
      },
      {
        key: "freedom_2_consecutive_weeks",
        label: "2 consecutive weeks under budget",
        description: "Have 2 consecutive weeks under budget",
      },
      {
        key: "freedom_reduced_nonessential",
        label: "Non-essential spend reduced",
        description: "Reduce spend in a non-essential category month-on-month",
      },
      {
        key: "freedom_hit_target",
        label: "Spending target hit",
        description: "Hit a spending target you set for yourself",
      },
    ],
  },
  {
    id: "debt-slayer",
    name: "The Debt Slayer",
    tagline: "Focused. Strategic. Temporary.",
    description:
      "Every logged transaction is a step toward the day the number hits zero. You know exactly what you owe and you're not interested in anything that doesn't serve that goal.",
    milestoneThresholds: [
      {
        key: "debt_slayer_debt_category",
        label: "Debt repayment category set",
        description: "Set a debt repayment category",
      },
      {
        key: "debt_slayer_month_logged",
        label: "Every week for a month logged",
        description: "Log every week for a month",
      },
      {
        key: "debt_slayer_4_of_5_under",
        label: "4 of 5 weeks under budget",
        description: "Stay under budget in 4 of 5 weeks",
      },
      {
        key: "debt_slayer_10pct_reduction",
        label: "10% spend reduction",
        description: "Reduce overall spend by 10% compared to first week",
      },
    ],
  },
];

export async function seedPersonas() {
  for (const persona of PERSONAS) {
    await db
      .insert(personasTable)
      .values(persona)
      .onConflictDoNothing();
  }
}

export async function getAllPersonas() {
  return db.select().from(personasTable);
}

export async function getPersonaById(id: string) {
  const [persona] = await db.select().from(personasTable).where(eq(personasTable.id, id));
  return persona ?? null;
}
