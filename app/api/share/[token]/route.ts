import { getShare, TOKEN_RE } from "@/lib/db";
import { clientIp, json, rateLimit } from "@/lib/security";

export const maxDuration = 10;

/** GET: retrieve a shared newspaper by its 9-char token. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = clientIp(req);
  if (!rateLimit(ip)) return json({ error: "Too many requests" }, 429);

  const { token } = await params;
  if (!TOKEN_RE.test(token)) {
    return json({ error: "Invalid token" }, 400);
  }

  const data = await getShare(token);
  if (!data) {
    return json({ error: "Newspaper not found or expired" }, 404);
  }
  return json(data);
}
