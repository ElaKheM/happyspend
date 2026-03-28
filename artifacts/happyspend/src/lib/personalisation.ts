export interface EmotionalProfile {
  notification: number;
  month_end: number;
  spending_trigger: number;
  money_story: number;
  goal: number;
}

export type PersonalisationContext =
  | "dashboard_subtext"
  | "dashboard_subtext_over_budget";

/**
 * Returns personalised copy for a given UI context based on the user's
 * emotional_profile from onboarding. Returns null when no rule matches —
 * callers should fall back to their default copy.
 */
export function getPersonalisedCopy(
  profile: EmotionalProfile | null | undefined,
  context: PersonalisationContext
): string | null {
  if (!profile) return null;

  switch (context) {
    case "dashboard_subtext_over_budget":
      if (profile.spending_trigger === 1) return "Every week is a fresh start.";
      return null;

    case "dashboard_subtext":
      if (profile.spending_trigger === 3) return "One entry at a time. That's all this is.";
      if (profile.goal === 2) return "Every week tracked is a week closer.";
      if (profile.goal === 3) return "Every deliberate week moves you closer to the life you want.";
      return null;
  }
}
