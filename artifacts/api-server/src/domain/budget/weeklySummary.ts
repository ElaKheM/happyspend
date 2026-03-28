import { calculatePersonaProgress } from "../persona/personaProgress";
import { checkNewMilestones } from "../persona/milestones";
import { getPersonalisedCopy, type EmotionalProfile } from "../personalisation";

interface Entry {
  entryDate: string;
  amount: string;
  description: string | null;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  monthlyBudget: string | number;
  colour: string;
  icon: string;
}

interface Persona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  milestoneThresholds: Array<{ key: string; label: string; description: string }>;
}

function dayWord(n: number): string {
  return n === 1 ? "day" : "days";
}

function getPersonaOpeningLine(
  personaId: string,
  spent: number,
  budgeted: number,
  daysLogged: number
): string {
  const d = `${daysLogged} ${dayWord(daysLogged)}`;
  const lines: Record<string, string> = {
    "steady-builder": `You showed up ${d} out of 7 this week. That consistency is exactly what building something solid looks like.`,
    "intentional-spender": `${d} logged. Every entry is a deliberate choice — that's the whole game.`,
    "freedom-seeker": `${d} tracked. Every week like this is a week closer to what you're working toward.`,
    "debt-slayer": `${d} in. You're building the habit that makes the number go down.`,
  };
  return lines[personaId] ?? `${d} logged this week. Keep going.`;
}

function getPersonaClosingLine(personaId: string, newMilestones: string[]): string {
  if (newMilestones.length > 0) {
    return "You hit a new milestone this week. That's not small.";
  }

  const lines: Record<string, string> = {
    "steady-builder": "Same time next week. You're building something real.",
    "intentional-spender": "Every logged entry is a decision, not a default. That matters.",
    "freedom-seeker": "Another week logged. Another week closer.",
    "debt-slayer": "Eyes on the number. You're getting there.",
  };
  return lines[personaId] ?? "Keep going. Every week counts.";
}

function formatR(amount: number): string {
  return "R" + new Intl.NumberFormat("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(amount));
}

function getCategoryHighlights(entries: Entry[], categories: Category[]): string[] {
  const spendByCategory: Record<string, number> = {};
  for (const entry of entries) {
    spendByCategory[entry.categoryId] =
      (spendByCategory[entry.categoryId] ?? 0) + Number(entry.amount);
  }

  return categories
    .filter((c) => spendByCategory[c.id] !== undefined)
    .map((c) => {
      const spent = spendByCategory[c.id] ?? 0;
      const weekly = Number(c.monthlyBudget) / 4.33;
      if (weekly <= 0) {
        return `${c.name}: ${formatR(spent)} spent this week`;
      }
      return `${c.name}: ${formatR(spent)} of ${formatR(weekly)} this week`;
    })
    .slice(0, 5);
}

interface Reallocation {
  fromCategoryId: string;
  fromCategoryName: string | null;
}

export function generateWeeklySummary(
  persona: Persona,
  entries: Entry[],
  categories: Category[],
  achievedMilestoneKeys: string[],
  weekStart: string,
  weekEnd: string,
  emotionalProfile?: EmotionalProfile | null,
  reallocations?: Reallocation[]
) {
  const totalBudgeted = categories.reduce(
    (sum, c) => sum + Number(c.monthlyBudget) / 4.33,
    0
  );
  const totalSpent = entries.reduce((sum, e) => sum + Number(e.amount), 0);
  const daysLogged = new Set(entries.map((e) => e.entryDate)).size;

  const newMilestones = checkNewMilestones(
    persona.id,
    entries,
    categories,
    achievedMilestoneKeys
  );

  const isOverSpend = totalSpent > totalBudgeted;

  // Opening: personalise for month_end=0 (relieved), fall back to persona line
  const openingLine =
    getPersonalisedCopy(emotionalProfile, "weekly_summary_opening") ??
    getPersonaOpeningLine(persona.id, totalSpent, totalBudgeted, daysLogged);

  const categoryHighlights = getCategoryHighlights(entries, categories);

  // Closing: personalise for goal=2 milestone, fall back to persona line
  const closingLine = newMilestones.length > 0
    ? (getPersonalisedCopy(emotionalProfile, "weekly_summary_milestone_closing") ?? "You hit a new milestone this week. That's not small.")
    : getPersonaClosingLine(persona.id, newMilestones);

  // Overspend message: only present when over budget
  const overspendMessage = isOverSpend
    ? (getPersonalisedCopy(emotionalProfile, "weekly_summary_overspend") ?? "More than planned — useful to know.")
    : null;

  // Reallocation narrative line
  let reallocationLine: string | null = null;
  if (reallocations && reallocations.length > 0) {
    const spendByFrom: Record<string, number> = {};
    const nameByFrom: Record<string, string> = {};
    for (const r of reallocations) {
      spendByFrom[r.fromCategoryId] = (spendByFrom[r.fromCategoryId] ?? 0) + 1;
      if (r.fromCategoryName) nameByFrom[r.fromCategoryId] = r.fromCategoryName;
    }
    const topFromId = Object.entries(spendByFrom).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topFromName = topFromId ? (nameByFrom[topFromId] ?? "That category") : "That category";
    reallocationLine = `${topFromName} is a little lighter this week. Worth keeping an eye on it next week.`;
  }

  return {
    weekStart,
    weekEnd,
    weekSummary: {
      totalBudgeted,
      totalSpent,
      difference: totalBudgeted - totalSpent,
      daysLogged,
      entriesLogged: entries.length,
    },
    narrative: {
      openingLine,
      categoryHighlights,
      overspendMessage,
      reallocationLine,
      closingLine,
    },
    newMilestones,
    personaProgress: calculatePersonaProgress(persona, achievedMilestoneKeys),
  };
}
