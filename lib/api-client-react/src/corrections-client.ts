import { customFetch } from "./custom-fetch";

export interface CategoryCorrection {
  id: string;
  userId: string;
  descriptionKeyword: string;
  suggestedCategoryId: string;
  chosenCategoryId: string;
  createdAt: string;
}

export interface CreateCorrectionBody {
  descriptionKeyword: string;
  suggestedCategoryId: string;
  chosenCategoryId: string;
}

export async function getCorrections(): Promise<CategoryCorrection[]> {
  return customFetch<CategoryCorrection[]>("/api/corrections");
}

export async function createCorrection(body: CreateCorrectionBody): Promise<CategoryCorrection> {
  return customFetch<CategoryCorrection>("/api/corrections", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
