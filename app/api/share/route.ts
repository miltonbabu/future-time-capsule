import { getShare, makeToken, saveShare, TOKEN_RE } from "@/lib/db";
import { clientIp, isSafeUrl, json, rateLimit, sanitizeText } from "@/lib/security";
import type { SharedNewspaper } from "@/lib/types";

export const maxDuration = 10;

/**
 * POST: create a share token. Downloads the AI illustration URL and converts
 * to base64 so the shared newspaper is permanent (CogView URLs expire).
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(ip)) return json({ error: "Too many requests" }, 429);

  let body: SharedNewspaper;
  try {
    body = (await req.json()) as SharedNewspaper;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!body?.id || !body?.article?.headline) {
    return json({ error: "Missing newspaper data" }, 400);
  }

  // Sanitize text fields.
  body.input = {
    name: sanitizeText(body.input?.name ?? "", 60),
    team: sanitizeText(body.input?.team ?? "", 60),
    achievement: sanitizeText(body.input?.achievement ?? "", 500),
    futureDate: body.input?.futureDate ?? "",
    language: body.input?.language === "zh" ? "zh" : "en",
    category: sanitizeText(body.input?.category ?? "default", 20),
    location: sanitizeText(body.input?.location ?? "", 100),
    memory: sanitizeText(body.input?.memory ?? "", 500),
  };

  // Persist illustration as base64 if it's a remote URL (CogView URLs expire).
  const img = body.imageUrl;
  if (img && !img.startsWith("data:")) {
    if (isSafeUrl(img)) {
      try {
        const r = await fetch(img);
        if (r.ok) {
          const buf = Buffer.from(await r.arrayBuffer());
          const ct = r.headers.get("content-type") || "image/png";
          body.imageUrl = `data:${ct};base64,${buf.toString("base64")}`;
        }
      } catch {
        // leave as remote URL; may expire later
      }
    } else {
      body.imageUrl = undefined;
    }
  }

  const token = makeToken();
  await saveShare(token, body);
  return json({ token });
}

/** GET: list metadata only (no full bodies) — optional helper. */
export async function GET(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(ip)) return json({ error: "Too many requests" }, 429);
  return json({ ok: true });
}

export { TOKEN_RE };
