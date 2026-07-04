import "server-only";

/**
 * Lightweight in-memory rate limiter + input validation for API routes.
 * Uses a rolling window per IP. Resets on serverless cold start (acceptable
 * for a hackathon app; upgrade to Redis-backed limiter for production scale).
 */

const WINDOW_MS = 60_000;
const MAX_REQ = 30;
const hits = new Map<string, { count: number; first: number }>();

export function rateLimit(ip: string, max = MAX_REQ): boolean {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now - e.first > WINDOW_MS) {
    hits.set(ip, { count: 1, first: now });
    return true;
  }
  e.count++;
  return e.count <= max;
}

export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

/** Strip <script>/<style> tags, collapse whitespace, cap length. */
export function sanitizeText(s: string, max = 500): string {
  return s
    .replace(/<\s*(script|style|iframe)[\s\S]*?<\/\s*\1\s*>/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Validate a name/team-like field: letters, CJK, spaces, basic punctuation. */
export function isValidName(s: string, max = 60): boolean {
  if (!s || s.length > max) return false;
  return /^[\p{L}\p{N}\s.,'&\-_!()?]+$/u.test(s);
}

/** SSRF guard: block non-http and localhost/private ranges. */
export function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "0.0.0.0" ||
      host.startsWith("127.") ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      host.startsWith("169.254.") ||
      host.endsWith(".local") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
