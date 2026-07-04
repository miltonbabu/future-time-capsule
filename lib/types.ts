export type Language = "en" | "zh";

export interface ArticleData {
  headline: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  future_quote: string;
  reward: string;
  image_prompt: string;
}

export interface CapsuleInput {
  name: string;
  team: string;
  achievement: string;
  futureDate: string; // ISO date string
  language: Language;
  category: string; // tech | ai | money | time | all
  location: string;
  memory?: string;
}

/** Full newspaper data — saved to localStorage, DB, and share tokens. */
export interface SharedNewspaper {
  id: string;
  token?: string;
  input: CapsuleInput;
  article: ArticleData;
  photoDataUrl?: string; // user uploaded photo (base64, compressed)
  imageUrl?: string; // AI illustration — may be remote URL or base64 data URL
  createdAt: string; // ISO timestamp
}

/** Capsule row in the file/Redis DB. */
export interface DbCapsule extends SharedNewspaper {
  _storedAt: string;
}

export type ArticleProvider = "glm" | "fallback";
