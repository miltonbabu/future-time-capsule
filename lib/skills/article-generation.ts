import type { ArticleData, CapsuleInput } from "../types";
import { glmChat, extractJson, fallbackArticle, generateAchievements } from "../glm";

export interface ArticleGenerationInput {
  input: CapsuleInput;
}

export interface ArticleGenerationOutput {
  article: ArticleData;
  provider: "glm" | "fallback";
}

export interface AchievementGenerationInput {
  category: string;
  language: CapsuleInput["language"];
}

export interface AchievementGenerationOutput {
  achievements: string[];
  provider: "glm" | "fallback";
}

export async function generateArticle(
  params: ArticleGenerationInput,
): Promise<ArticleGenerationOutput> {
  const { input } = params;
  const year = new Date(input.futureDate).getFullYear() || 2035;

  const langInstr =
    input.language === "zh"
      ? "请用中文输出。严格按照JSON格式，不要使用markdown代码块。"
      : "Write in English. Return ONLY valid JSON, no markdown code fences.";

  const sys = `${langInstr}You are a futuristic newspaper journalist writing a front-page article for "THE FUTURE TIME CAPSULE". Generate a complete article with these fields:
- headline: Bold, attention-grabbing newspaper headline (all caps preferred for English)
- paragraph1: Opening paragraph — dramatic, engaging
- paragraph2: Second paragraph — adds context/color
- paragraph3: Closing paragraph — punchy, memorable
- future_quote: A memorable quote from the person (short, witty)
- reward: A lavish, funny reward for the achievement
- image_prompt: A detailed image prompt for an AI illustrator (no people/faces, photorealistic sepia newspaper style)

Make it absurd, witty, and funny. The article should feel like it's from a vintage newspaper in the year ${year}. Return ONLY a valid JSON object with all 7 fields.`;

  const user = `Write a newspaper article for:
- Name: ${input.name}
- Team: ${input.team}
- Location: ${input.location || "Zhengzhou"}
- Achievement: ${input.achievement}
- Memory: ${input.memory || "N/A"}
- Future Date: ${year}
- Category: ${input.category}`;

  const raw = await glmChat(sys, user);
  if (raw) {
    const article = extractJson<ArticleData>(raw);
    if (article && article.headline && article.paragraph1) {
      return { article, provider: "glm" };
    }
  }

  return {
    article: fallbackArticle(
      input.name,
      input.team,
      input.achievement,
      year,
      input.language,
      input.category,
    ),
    provider: "fallback",
  };
}

export async function generateAchievementList(
  params: AchievementGenerationInput,
): Promise<AchievementGenerationOutput> {
  const { category, language } = params;
  const generated = await generateAchievements(category, language);
  if (generated && generated.length > 0) {
    return { achievements: generated, provider: "glm" };
  }
  return {
    achievements: [],
    provider: "fallback",
  };
}