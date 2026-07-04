import { deleteCapsule, getCapsules, saveCapsule } from "@/lib/db";
import { clientIp, json, rateLimit, sanitizeText } from "@/lib/security";
import type { DbCapsule } from "@/lib/types";

export const maxDuration = 10;

/** GET: list all capsules. */
export async function GET(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(ip)) return json({ error: "Too many requests" }, 429);
  const capsules = await getCapsules();
  return json({ capsules });
}

/** POST: save a capsule. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(ip)) return json({ error: "Too many requests" }, 429);

  let body: DbCapsule;
  try {
    body = (await req.json()) as DbCapsule;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!body?.id) return json({ error: "Missing id" }, 400);

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
  body._storedAt = new Date().toISOString();

  await saveCapsule(body);
  return json({ success: true });
}

/** DELETE: remove a capsule by id. */
export async function DELETE(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(ip)) return json({ error: "Too many requests" }, 429);

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const id = sanitizeText(body.id ?? "", 60);
  if (!id) return json({ error: "Missing id" }, 400);
  await deleteCapsule(id);
  return json({ success: true });
}
