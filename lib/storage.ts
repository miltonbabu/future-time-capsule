import type { SharedNewspaper } from "./types";

/**
 * Client-side localStorage CRUD for saved newspapers.
 * Max 20 capsules. 3-tier quota fallback: full → without images → current only.
 */

const KEY = "ftc_capsules";
const MAX = 20;

export function loadCapsules(): SharedNewspaper[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SharedNewspaper[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persist(capsules: SharedNewspaper[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(capsules));
    return true;
  } catch {
    // Quota exceeded — try progressively smaller payloads.
    try {
      const noImages = capsules.map((c) => ({
        ...c,
        photoDataUrl: undefined,
        imageUrl: undefined,
      }));
      localStorage.setItem(KEY, JSON.stringify(noImages));
      return true;
    } catch {
      try {
        const currentOnly = capsules.slice(0, 1);
        localStorage.setItem(KEY, JSON.stringify(currentOnly));
        return true;
      } catch {
        return false;
      }
    }
  }
}

export function saveCapsule(c: SharedNewspaper): SharedNewspaper[] {
  const all = loadCapsules();
  const idx = all.findIndex((x) => x.id === c.id);
  if (idx >= 0) all[idx] = c;
  else all.unshift(c);
  const trimmed = all.slice(0, MAX);
  persist(trimmed);
  return trimmed;
}

export function removeCapsule(id: string): SharedNewspaper[] {
  const all = loadCapsules();
  const next = all.filter((x) => x.id !== id);
  persist(next);
  return next;
}

/** Compress an uploaded image to ~400x500 JPEG @ 0.7 quality (~50-100KB). */
export function compressImage(
  file: File | Blob,
  maxW = 400,
  maxH = 500,
  quality = 0.7,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const ratio = Math.min(maxW / width, maxH / height, 1);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("no canvas ctx"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Generate a short unique id for client use. */
export function makeId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}
