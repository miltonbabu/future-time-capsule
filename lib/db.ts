import "server-only";
import type { Redis } from "@upstash/redis";
import type { DbCapsule, SharedNewspaper } from "./types";

/**
 * Server-side persistence layer.
 * - Production (Vercel): Upstash Redis when env vars are present.
 * - Local dev / fallback: file-based JSON under .data/ (or /tmp/.data/ on Vercel).
 */

let _redis: Redis | null | undefined;

async function getRedis(): Promise<Redis | null> {
  if (_redis !== undefined) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    _redis = null;
    return null;
  }
  const { Redis: RedisCls } = await import("@upstash/redis");
  _redis = new RedisCls({ url, token });
  return _redis;
}

const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? "/tmp/.data" : ".data";
const CAPSULES_FILE = `${DATA_DIR}/capsules.json`;
const SHARES_FILE = `${DATA_DIR}/shares.json`;

const SHARE_TTL_SEC = 60 * 60 * 24 * 30; // 30 days

import { promises as fs } from "fs";
import path from "path";

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await ensureDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

/* ----------------------------- Capsules ----------------------------- */

export async function getCapsules(): Promise<DbCapsule[]> {
  const redis = await getRedis();
  if (redis) {
    const ids = (await redis.smembers("capsules:ids")) as string[];
    if (!ids.length) return [];
    const items = await Promise.all(
      ids.map((id) => redis.get<DbCapsule>(`capsule:${id}`)),
    );
    return items.filter((x): x is DbCapsule => !!x);
  }
  return readJson<DbCapsule[]>(CAPSULES_FILE, []);
}

export async function saveCapsule(c: DbCapsule): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.set(`capsule:${c.id}`, c);
    await redis.sadd("capsules:ids", c.id);
    return;
  }
  const all = await readJson<DbCapsule[]>(CAPSULES_FILE, []);
  const idx = all.findIndex((x) => x.id === c.id);
  if (idx >= 0) all[idx] = c;
  else all.push(c);
  await writeJson(CAPSULES_FILE, all);
}

export async function deleteCapsule(id: string): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.del(`capsule:${id}`);
    await redis.srem("capsules:ids", id);
    return;
  }
  const all = await readJson<DbCapsule[]>(CAPSULES_FILE, []);
  await writeJson(
    CAPSULES_FILE,
    all.filter((x) => x.id !== id),
  );
}

/* ----------------------------- Shares ----------------------------- */

/** 9-char base32 token, URL-friendly. */
export function makeToken(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  for (let i = 0; i < 9; i++) s += alphabet[bytes[i] % alphabet.length];
  return s;
}

export const TOKEN_RE = /^[a-z0-9]{9}$/;

export async function saveShare(
  token: string,
  data: SharedNewspaper,
): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.set(`share:${token}`, data, { ex: SHARE_TTL_SEC });
    return;
  }
  const all = await readJson<Record<string, SharedNewspaper>>(SHARES_FILE, {});
  all[token] = data;
  await writeJson(SHARES_FILE, all);
}

export async function getShare(
  token: string,
): Promise<SharedNewspaper | null> {
  const redis = await getRedis();
  if (redis) {
    const v = await redis.get<SharedNewspaper>(`share:${token}`);
    return v ?? null;
  }
  const all = await readJson<Record<string, SharedNewspaper>>(SHARES_FILE, {});
  return all[token] ?? null;
}
