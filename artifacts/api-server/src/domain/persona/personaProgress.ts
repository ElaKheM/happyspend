interface MilestoneThreshold {
  key: string;
  label: string;
  description: string;
}

interface Persona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  milestoneThresholds: MilestoneThreshold[];
}

export function getProgressStage(percentage: number): string {
  if (percentage <= 24) return "Just Starting";
  if (percentage <= 49) return "Building Momentum";
  if (percentage <= 74) return "Getting There";
  if (percentage <= 99) return "Almost There";
  return "You've Arrived";
}

export function calculatePersonaProgress(
  persona: Persona,
  achievedMilestoneKeys: string[]
) {
  const milestones = persona.milestoneThresholds;
  const total = milestones.length;
  const achieved = milestones.filter((m) =>
    achievedMilestoneKeys.includes(m.key)
  ).length;
  const percentage = total === 0 ? 0 : Math.round((achieved / total) * 100);

  return {
    percentage,
    achieved,
    total,
    stage: getProgressStage(percentage),
    nextMilestone: milestones.find(
      (m) => !achievedMilestoneKeys.includes(m.key)
    ) ?? null,
    isComplete: achieved === total,
  };
}
