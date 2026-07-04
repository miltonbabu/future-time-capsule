import type { CapsuleInput, Language } from "./types";

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: string, lang: Language) => string | null;
}

export const FIELD_RULES: Record<keyof CapsuleInput, FieldRule> = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 60,
    pattern: /^[\p{L}\p{N}\s.,'&\-_!()?]+$/u,
  },
  team: {
    required: true,
    minLength: 1,
    maxLength: 60,
    pattern: /^[\p{L}\p{N}\s.,'&\-_!()?]+$/u,
  },
  achievement: {
    required: true,
    minLength: 1,
    maxLength: 500,
  },
  futureDate: {
    required: true,
    validate: (value: string, lang: Language) => {
      if (!value) return lang === "zh" ? "请选择一个未来日期。" : "Please choose a future date.";
      const date = new Date(value);
      if (isNaN(date.getTime())) return lang === "zh" ? "日期格式无效。" : "Invalid date format.";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date <= today) return lang === "zh" ? "日期必须是未来的日期。" : "Date must be in the future.";
      return null;
    },
  },
  language: {
    required: true,
    validate: (value: string) => {
      if (value !== "en" && value !== "zh") return "Invalid language.";
      return null;
    },
  },
  category: {
    required: true,
    validate: (value: string) => {
      const validCategories = ["tech", "ai", "money", "time", "all"];
      if (!validCategories.includes(value)) return "Invalid category.";
      return null;
    },
  },
  location: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[\p{L}\p{N}\s.,'&\-_!()?]+$/u,
  },
  memory: {
    maxLength: 500,
  },
};

export const RATE_LIMIT_RULES = {
  WINDOW_MS: 60_000,
  MAX_REQUESTS: 30,
};

export const STORAGE_RULES = {
  MAX_CAPSULES: 20,
  MAX_PHOTO_WIDTH: 400,
  MAX_PHOTO_HEIGHT: 500,
  PHOTO_QUALITY: 0.7,
};

export const SHARE_RULES = {
  TOKEN_LENGTH: 9,
  TOKEN_PATTERN: /^[a-z0-9]{9}$/,
  TTL_SECONDS: 60 * 60 * 24 * 30,
};

export const VALIDATION_MESSAGES: Record<Language, Record<string, string>> = {
  en: {
    required: "This field is required.",
    minLength: "Too short.",
    maxLength: "Too long.",
    invalidPattern: "Invalid characters.",
    photoRequired: "Please add your photo.",
  },
  zh: {
    required: "此字段为必填项。",
    minLength: "太短了。",
    maxLength: "太长了。",
    invalidPattern: "包含无效字符。",
    photoRequired: "请上传你的照片。",
  },
};

export function validateCapsuleInput(
  input: Partial<CapsuleInput>,
  lang: Language,
  requirePhoto: boolean = true,
  photoDataUrl?: string,
): ValidationResult {
  const errors: Record<string, string> = {};
  const msgs = VALIDATION_MESSAGES[lang];

  Object.entries(FIELD_RULES).forEach(([field, rule]) => {
    const value = (input as Record<string, unknown>)[field] as string | undefined;
    const stringValue = value?.toString() || "";

    if (rule.required && !stringValue.trim()) {
      errors[field] = msgs.required;
      return;
    }

    if (!stringValue.trim()) return;

    if (rule.minLength && stringValue.length < rule.minLength) {
      errors[field] = msgs.minLength;
      return;
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      errors[field] = msgs.maxLength;
      return;
    }

    if (rule.pattern && !rule.pattern.test(stringValue)) {
      errors[field] = msgs.invalidPattern;
      return;
    }

    if (rule.validate) {
      const validationError = rule.validate(stringValue, lang);
      if (validationError) {
        errors[field] = validationError;
      }
    }
  });

  if (requirePhoto && !photoDataUrl) {
    errors.photo = msgs.photoRequired;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function sanitizeInput(input: Partial<CapsuleInput>): Partial<CapsuleInput> {
  const sanitized: Partial<CapsuleInput> = {};

  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === "string") {
      let sanitizedValue = value
        .replace(/<\s*(script|style|iframe)[\s\S]*?<\/\s*\1\s*>/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      const rule = FIELD_RULES[key as keyof CapsuleInput];
      if (rule?.maxLength) {
        sanitizedValue = sanitizedValue.slice(0, rule.maxLength);
      }

      (sanitized as Record<string, unknown>)[key] = sanitizedValue;
    } else {
      (sanitized as Record<string, unknown>)[key] = value;
    }
  });

  return sanitized;
}

export function isValidShareToken(token: string): boolean {
  return SHARE_RULES.TOKEN_PATTERN.test(token);
}

export function isValidCategory(category: string): boolean {
  return ["tech", "ai", "money", "time", "all"].includes(category);
}

export function isValidLanguage(language: string): language is Language {
  return language === "en" || language === "zh";
}