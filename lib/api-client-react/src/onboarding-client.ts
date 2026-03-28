import { customFetch } from "./custom-fetch";

export interface SaveAnswerBody {
  questionKey: string;
  answerIndex: number;
}

export interface EmotionalProfile {
  notification: number;
  month_end: number;
  spending_trigger: number;
  money_story: number;
  goal: number;
}

export async function saveOnboardingAnswer(body: SaveAnswerBody): Promise<void> {
  await customFetch("/api/onboarding/answer", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function saveEmotionalProfile(profile: EmotionalProfile): Promise<void> {
  await customFetch("/api/onboarding/emotional-profile", {
    method: "POST",
    body: JSON.stringify({ profile }),
  });
}
