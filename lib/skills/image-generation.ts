import { fetchWithTimeout, glmTimeout } from "../glm";

export interface ImageGenerationInput {
  prompt: string;
}

export interface ImageGenerationOutput {
  imageUrl: string;
  provider: "cogview" | "fallback";
}

const COGVIEW_BASE = "https://open.bigmodel.cn/api/paas/v4/images/generations";

function cogviewHeaders(): Record<string, string> {
  const key = process.env.GLM_API_KEY;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
}

export async function generateImage(
  params: ImageGenerationInput,
): Promise<ImageGenerationOutput> {
  const { prompt } = params;
  const key = process.env.GLM_API_KEY;
  if (!key) {
    return {
      imageUrl: "",
      provider: "fallback",
    };
  }

  const body = {
    model: "cogview-3-flash",
    prompt,
    n: 1,
    size: "1024x1024",
  };

  try {
    const res = await fetchWithTimeout(
      COGVIEW_BASE,
      {
        method: "POST",
        headers: cogviewHeaders(),
        body: JSON.stringify(body),
      },
      glmTimeout(),
    );

    if (!res.ok) {
      return {
        imageUrl: "",
        provider: "fallback",
      };
    }

    const data = await res.json();
    const imageUrl: string | undefined = data?.data?.[0]?.url;
    if (imageUrl) {
      return { imageUrl, provider: "cogview" };
    }
  } catch {
    /* fall through */
  }

  return {
    imageUrl: "",
    provider: "fallback",
  };
}