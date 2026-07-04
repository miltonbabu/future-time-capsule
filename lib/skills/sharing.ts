import type { SharedNewspaper } from "../types";
import { makeToken, saveShare, getShare } from "../db";
import { isSafeUrl } from "../security";

export interface CreateShareInput {
  newspaper: SharedNewspaper;
}

export interface CreateShareOutput {
  token: string;
}

export interface GetShareInput {
  token: string;
}

export interface GetShareOutput {
  newspaper: SharedNewspaper | null;
}

export async function createShare(
  params: CreateShareInput,
): Promise<CreateShareOutput> {
  const { newspaper } = params;
  const token = makeToken();

  let { imageUrl } = newspaper;
  if (imageUrl && !imageUrl.startsWith("data:")) {
    if (isSafeUrl(imageUrl)) {
      try {
        const r = await fetch(imageUrl);
        if (r.ok) {
          const buf = Buffer.from(await r.arrayBuffer());
          const ct = r.headers.get("content-type") || "image/png";
          imageUrl = `data:${ct};base64,${buf.toString("base64")}`;
        }
      } catch {
        /* leave as remote URL */
      }
    } else {
      imageUrl = undefined;
    }
  }

  await saveShare(token, {
    ...newspaper,
    imageUrl,
  });

  return { token };
}

export async function retrieveShare(
  params: GetShareInput,
): Promise<GetShareOutput> {
  const { token } = params;
  const newspaper = await getShare(token);
  return { newspaper };
}