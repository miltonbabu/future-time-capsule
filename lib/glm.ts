import "server-only";
import type { ArticleData, Language } from "./types";
export { ACHIEVEMENT_POOLS } from "./achievements";

/**
 * Zhipu GLM API helpers + pre-built fallback article templates.
 * GLM-4-Flash for text (article + achievements), CogView-3-Flash for images (free).
 */

const GLM_BASE = "https://open.bigmodel.cn/api/paas/v4";
const TIMEOUT_VERCEL = 15_000;
const TIMEOUT_SELF = 30_000;
export const glmTimeout = () =>
  process.env.VERCEL ? TIMEOUT_VERCEL : TIMEOUT_SELF;

/** Fetch with timeout via AbortController. */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms: number,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

function glmHeaders(): Record<string, string> {
  const key = process.env.GLM_API_KEY;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
}

/** Generate JWT-free GLM chat completion (Bearer key works for v4). */
export async function glmChat(
  systemPrompt: string,
  userPrompt: string,
  opts: { temperature?: number; model?: string } = {},
): Promise<string | null> {
  const key = process.env.GLM_API_KEY;
  if (!key) return null;
  const model = opts.model ?? "glm-4-flash";
  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: opts.temperature ?? 0.8,
  };
  try {
    const res = await fetchWithTimeout(
      `${GLM_BASE}/chat/completions`,
      { method: "POST", headers: glmHeaders(), body: JSON.stringify(body) },
      glmTimeout(),
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    return text ?? null;
  } catch {
    return null;
  }
}

/** Extract a JSON object/array from a model response that may wrap it in fences/prose. */
export function extractJson<T>(raw: string): T | null {
  if (!raw) return null;
  // Strip markdown code fences.
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  // Find first { or [ and last matching } or ].
  const start = s.search(/[{[]/);
  if (start === -1) return null;
  const open = s[start];
  const close = open === "{" ? "}" : "]";
  const end = s.lastIndexOf(close);
  if (end === -1 || end < start) return null;
  try {
    return JSON.parse(s.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

/* ----------------------- Article fallback templates ----------------------- */

function tmpl(
  name: string,
  team: string,
  achievement: string,
  year: number,
  lang: Language,
  cat: "tech" | "ai" | "money" | "time" | "default",
): ArticleData {
  const isZh = lang === "zh";
  const lead = isZh ? `${name}与${team}` : `${name} of ${team}`;
  const first = isZh ? "一夜之间" : "Overnight,";
  const lib: Record<
    string,
    { h: string; p1: string; p2: string; p3: string; q: string; r: string; img: string }
  > = {
    tech: {
      h: isZh
        ? `${team}团队震惊科技界`
        : `${team} STUNS THE TECH WORLD`,
      p1: isZh
        ? `${first}，${lead}凭借"${achievement}"在${year}年登顶全球科技版图。`
        : `${first} ${lead} topped the global tech map in ${year} by "${achievement}".`,
      p2: isZh
        ? `业界评论员称这是自云计算诞生以来最重大的突破。`
        : `Industry analysts called it the biggest breakthrough since the dawn of cloud computing.`,
      p3: isZh
        ? `${team}的服务器至今仍在冒烟，但所有人都笑了。`
        : `${team}'s servers are still smoking, but everyone is smiling.`,
      q: isZh
        ? `我只是想让它跑起来——没想到它跑到了未来。`
        : `I just wanted it to run — I didn't expect it to run all the way to the future.`,
      r: isZh
        ? `终身畅享${year}年顶配开发者键盘。`
        : `A lifetime supply of ${year}-edition premium developer keyboards.`,
      img: `futuristic server room glowing with neon data streams, year ${year}, photorealistic sepia newspaper photo, no people no faces`,
    },
    ai: {
      h: isZh
        ? `${team}AI失控——但很可爱`
        : `${team} AI GOES ROGUE — ADORABLY`,
      p1: isZh
        ? `${first}，${lead}训练的AI在"${achievement}"后学会了写诗。`
        : `${first} ${lead}'s AI learned to write poetry after "${achievement}".`,
      p2: isZh
        ? `它的第一首诗标题是《0与1之间》。`
        : `Its debut poem was titled "Between Zero and One".`,
      p3: isZh
        ? `专家表示这是有史以来最浪漫的故障。`
        : `Experts called it the most romantic glitch in history.`,
      q: isZh
        ? `它比我会说话，但工资还得我领。`
        : `It talks better than me, but I still cash the paycheck.`,
      r: isZh
        ? `一张写满代码的情人节贺卡。`
        : `A Valentine's card written entirely in code.`,
      img: `glowing neural network forming a heart shape, futuristic ${year}, photorealistic sepia newspaper photo, no people no faces`,
    },
    money: {
      h: isZh
        ? `${team}估值突破万亿`
        : `${team} HITS TRILLION-DOLLAR VALUATION`,
      p1: isZh
        ? `${first}，${lead}通过"${achievement}"让公司估值冲破天际。`
        : `${first} ${lead} sent the company's valuation through the roof via "${achievement}".`,
      p2: isZh
        ? `银行排队求着送钱，CEO只回了一句：先排队。`
        : `Banks lined up to offer cash; the CEO replied: take a number.`,
      p3: isZh
        ? `连办公室的咖啡机都涨了工资。`
        : `Even the office coffee machine got a raise.`,
      q: isZh
        ? `钱不是问题——问题是钱包装不下。`
        : `Money's not the problem — the wallet is.`,
      r: isZh
        ? `一枚纯金做的回车键。`
        : `A solid-gold Enter key.`,
      img: `futuristic skyscraper with golden light, year ${year}, photorealistic sepia newspaper photo, no people no faces`,
    },
    time: {
      h: isZh
        ? `${team}改写了时间线`
        : `${team} REWRITES THE TIMELINE`,
      p1: isZh
        ? `${first}，${lead}在"${achievement}"后发现自己迟到了昨天。`
        : `${first} ${lead} discovered they were late for yesterday after "${achievement}".`,
      p2: isZh
        ? `时间警察已介入，但拒绝透露是哪一年。`
        : `The Time Police intervened but refused to disclose which year.`,
      p3: isZh
        ? `据信这是史上第一次"明天见"变成"昨天见"。`
        : `Believed to be the first time "see you tomorrow" became "see you yesterday".`,
      q: isZh
        ? `我到得太早，所以迟到了。`
        : `I arrived so early I was late.`,
      r: isZh
        ? `一块永远慢五分钟的怀表。`
        : `A pocket watch that's always five minutes slow.`,
      img: `futuristic clockwork city with floating gears, year ${year}, photorealistic sepia newspaper photo, no people no faces`,
    },
    default: {
      h: isZh
        ? `${team}创造了历史`
        : `${team} MAKES HISTORY`,
      p1: isZh
        ? `${first}，${lead}凭借"${achievement}"在${year}年载入史册。`
        : `${first} ${lead} entered the history books in ${year} through "${achievement}".`,
      p2: isZh
        ? `全球媒体争相报道这一里程碑事件。`
        : `Global media raced to cover this milestone event.`,
      p3: isZh
        ? `${team}表示，这只是一个开始。`
        : `${team} said this is only the beginning.`,
      q: isZh
        ? `梦想照进现实，比想象中更亮。`
        : `The dream walked into daylight, brighter than imagined.`,
      r: isZh
        ? `一张通往${year}年的单程票。`
        : `A one-way ticket to ${year}.`,
      img: `futuristic city skyline at dawn, year ${year}, photorealistic sepia newspaper photo, no people no faces`,
    },
  };
  const e = lib[cat] ?? lib.default;
  return {
    headline: e.h,
    paragraph1: e.p1,
    paragraph2: e.p2,
    paragraph3: e.p3,
    future_quote: e.q,
    reward: e.r,
    image_prompt: e.img,
  };
}

export function fallbackArticle(
  name: string,
  team: string,
  achievement: string,
  year: number,
  lang: Language,
  category: string,
): ArticleData {
  const cat = (["tech", "ai", "money", "time"].includes(category)
    ? category
    : "default") as "tech" | "ai" | "money" | "time" | "default";
  return tmpl(name, team, achievement, year, lang, cat);
}

/* ----------------------- Achievement generation ----------------------- */

/** Call GLM to generate 3 funny achievements; returns null on any failure. */
export async function generateAchievements(
  category: string,
  lang: Language,
): Promise<string[] | null> {
  const langInstr =
    lang === "zh"
      ? "请用中文输出，每条不超过10个字。"
      : "Write in English. Keep each achievement under 8 words. ";
  const sys = `${langInstr}You are a witty hackathon participant writing absurd, punchy one-liner future achievements. Generate 3 extremely short, hilarious achievement ideas (one phrase each, like a headline). Each must be under 10 words, absurd, tech-themed, and about ridiculous future success. Think punchy newspaper-headline humor. Return ONLY a valid JSON array of 3 short strings, no markdown, no code fences.`;
  const user = `Generate 3 hilarious one-liner future achievements for the category: ${category}. Max 10 words each. Absurd, punchy, funny.`;
  const raw = await glmChat(sys, user, { temperature: 1.0 });
  if (!raw) return null;
  const arr = extractJson<string[]>(raw);
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr.filter((x) => typeof x === "string").slice(0, 3);
}
