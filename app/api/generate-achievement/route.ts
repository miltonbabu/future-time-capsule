import { generateAchievements } from "@/lib/glm";
import { clientIp, json, rateLimit, sanitizeText } from "@/lib/security";
import type { Language } from "@/lib/types";

export const maxDuration = 10;

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(ip)) return json({ error: "Too many requests" }, 429);

  let body: { category?: string; language?: Language };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const category = sanitizeText(body.category ?? "all", 20);
  const language: Language = body.language === "zh" ? "zh" : "en";

  const achievements = await generateAchievements(category, language);
  return json({ achievements });
}
