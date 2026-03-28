import { calculatePersonaProgress } from "../persona/personaProgress";
import { checkNewMilestones } from "../persona/milestones";

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

export function generateWeeklySummary(
  persona: Persona,
  entries: Entry[],
  categories: Category[],
  achievedMilestoneKeys: string[],
  weekStart: string,
  weekEnd: string
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

  const openingLine = getPersonaOpeningLine(persona.id, totalSpent, totalBudgeted, daysLogged);
  const categoryHighlights = getCategoryHighlights(entries, categories);
  const closingLine = getPersonaClosingLine(persona.id, newMilestones);

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
      closingLine,
    },
    newMilestones,
    personaProgress: calculatePersonaProgress(persona, achievedMilestoneKeys),
  };
}
