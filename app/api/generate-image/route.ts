import { fetchWithTimeout, glmTimeout } from "@/lib/glm";
import { clientIp, isSafeUrl, json, rateLimit, sanitizeText } from "@/lib/security";

export const maxDuration = 30;

const STYLE_SUFFIX = ", vintage newspaper photo style, sepia tone, cinematic lighting, highly detailed, photorealistic, no people no faces, news photography aesthetic";
const MAX_PROMPT = 250;

/**
 * Server-side image generation via free CogView-3-Flash (~5-10s).
 * Returns the generated image URL. Never exposes the API key to the client.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(ip)) return json({ error: "Too many requests" }, 429);

  const key = process.env.GLM_API_KEY;
  if (!key) {
    return json({ src: null, error: "GLM_API_KEY not configured" }, 200);
  }

  let body: { prompt?: string; achievement?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  let prompt = sanitizeText(body.prompt ?? "", 300);
  if (!prompt) return json({ error: "Missing prompt" }, 400);

  if (body.achievement) {
    prompt = `${body.achievement}. ${prompt}`;
  }

  const maxBase = Math.max(20, MAX_PROMPT - STYLE_SUFFIX.length);
  if (prompt.length + STYLE_SUFFIX.length > MAX_PROMPT) {
    prompt = prompt.slice(0, maxBase);
  }
  const finalPrompt = prompt + STYLE_SUFFIX;

  try {
    const res = await fetchWithTimeout(
      "https://open.bigmodel.cn/api/paas/v4/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "cogview-3-flash",
          prompt: finalPrompt,
          width: 1024,
          height: 576,
        }),
      },
      25_000,
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return json({ src: null, error: `Image API ${res.status}: ${txt.slice(0, 200)}` }, 200);
    }
    const data = await res.json();
    const url: string | undefined = data?.data?.[0]?.url;
    if (!url || !isSafeUrl(url)) {
      return json({ src: null, error: "No valid image URL returned" }, 200);
    }
    return json({ src: url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return json({ src: null, error: `Image generation failed: ${msg}` }, 200);
  }
}
