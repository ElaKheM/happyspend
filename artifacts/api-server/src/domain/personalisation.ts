export interface EmotionalProfile {
  notification: number;
  month_end: number;
  spending_trigger: number;
  money_story: number;
  goal: number;
}

export type PersonalisationContext =
  | "dashboard_subtext"
  | "dashboard_subtext_over_budget"
  | "weekly_summary_opening"
  | "weekly_summary_overspend"
  | "weekly_summary_milestone_closing"
  | "push_notification_default";

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
      // spending_trigger=1 → guilty immediately
      if (profile.spending_trigger === 1) return "Every week is a fresh start.";
      return null;

    case "dashboard_subtext":
      // spending_trigger=3 → anxious about later
      if (profile.spending_trigger === 3) return "One entry at a time. That's all this is.";
      // goal=2 → pay something off
      if (profile.goal === 2) return "Every week tracked is a week closer.";
      // goal=3 → freedom
      if (profile.goal === 3) return "Every deliberate week moves you closer to the life you want.";
      return null;

    case "weekly_summary_opening":
      // month_end=0 → relieved
      if (profile.month_end === 0)
        return "You made it through another week. That relief you feel? You've earned it.";
      return null;

    case "weekly_summary_overspend":
      // spending_trigger=1 → guilty immediately
      if (profile.spending_trigger === 1) return "That's information, not a verdict.";
      return null;

    case "weekly_summary_milestone_closing":
      // goal=2 → pay something off
      if (profile.goal === 2) return "Logged again. The number gets smaller.";
      return null;

    case "push_notification_default":
      // notification=2 → knot in stomach — never urgency language
      if (profile.notification === 2) return "Just one log. No pressure, no judgment.";
      // spending_trigger=3 → anxious about later
      if (profile.spending_trigger === 3) return "Just one log. That's all it takes today.";
      return null;
  }
}
