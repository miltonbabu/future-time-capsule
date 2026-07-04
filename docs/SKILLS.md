# 📰 Future Time Capsule — Skill Modules

> *Built at TRAE Friends Zhengzhou Hackathon, July 2026*

---

## 🎯 Overview

This project implements several key skill modules that power the Future Time Capsule application. Each skill has a clear responsibility, input/output specifications, and integration points.

---

## 📝 Skill 1: Article Generation

### Responsibility
Generate witty, context-aware newspaper articles from user input.

### Input
```typescript
interface ArticleInput {
  name: string;
  team: string;
  achievement: string;
  futureDate: string; // ISO date string
  language: "en" | "zh";
}
```

### Output
```typescript
interface ArticleOutput {
  headline: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  future_quote: string;
  reward: string;
  image_prompt: string; // English description for image generation
}
```

### Integration
- **Endpoint:** `POST /api/generate-article`
- **Model:** GLM-4-Flash
- **Fallback:** Pre-built template articles by category (5 categories, bilingual)

### Key Features
- Achievement is the central focus of the article
- Headline must include team name
- First-person quote from the person
- Short funny reward line
- Language-specific generation (English/Chinese)

---

## 🖼️ Skill 2: Image Generation

### Responsibility
Generate photorealistic newspaper-style illustrations based on achievement context.

### Input
```typescript
interface ImageInput {
  prompt: string;       // Image prompt from article generation
  achievement: string;  // User's achievement for context
}
```

### Output
```typescript
interface ImageOutput {
  src: string | null;   // Image URL if successful
  error?: string;       // Error message if failed
}
```

### Integration
- **Endpoint:** `POST /api/generate-image`
- **Model:** CogView-3-Flash (free)
- **Fallback:** Skip image — newspaper renders without illustration

### Key Features
- Free image generation (CogView-3-Flash)
- Vintage newspaper photo style
- Sepia tone, cinematic lighting
- No people or faces
- 1024×576 aspect ratio (widescreen banner)

---

## 🏆 Skill 3: Achievement Generation

### Responsibility
Generate creative, category-specific achievement suggestions.

### Input
```typescript
interface AchievementInput {
  category: "tech" | "ai" | "money" | "time" | "all";
  language: "en" | "zh";
}
```

### Output
```typescript
interface AchievementOutput {
  achievements: string[];  // Array of 3 achievement ideas
}
```

### Integration
- **Endpoint:** `POST /api/generate-achievement`
- **Model:** GLM-4-Flash
- **Fallback:** Pre-defined achievement pools by category

### Key Features
- 3 ideas per request
- Short (10-15 words each)
- Funny and creative
- Category-specific
- Language-specific generation

---

## 🔗 Skill 4: Sharing System

### Responsibility
Create shareable links for newspapers with images.

### Input
```typescript
interface ShareInput {
  newspaper: SharedNewspaper;  // Full newspaper data including images
}
```

### Output
```typescript
interface ShareOutput {
  token: string;  // 9-character share token
  url: string;    // Full share URL
}
```

### Integration
- **Endpoint:** `POST /api/share`
- **Storage:** Upstash Redis (Vercel) / JSON files (local)
- **QR Code:** Generated client-side using qrcode.react

### Key Features
- 9-character unique share tokens
- Full newspaper data stored server-side
- Images converted to base64 for permanence
- QR code generation for mobile sharing
- 30-day validity for shared links

---

## 💾 Skill 5: Local Storage

### Responsibility
Manage user's saved newspapers locally.

### Input
```typescript
interface StorageInput {
  newspaper: SharedNewspaper;
}
```

### Output
```typescript
interface StorageOutput {
  saved: SharedNewspaper[];  // All saved newspapers
}
```

### Integration
- **Storage:** Browser localStorage (max 5MB)
- **Max Items:** 20 newspapers
- **Compression:** Photos compressed to 400×500px JPEG at 0.7 quality

### Key Features
- Automatic save after generation
- Progressive quota fallback (full → without images → current only)
- CRUD operations (create, read, update, delete)
- Survives page refresh

---

## 🌐 Skill 6: Internationalization

### Responsibility
Provide bilingual support for all UI strings and AI content.

### Input
```typescript
interface I18nInput {
  key: TranslationKey;
  language: "en" | "zh";
}
```

### Output
```typescript
interface I18nOutput {
  text: string;  // Translated text
}
```

### Integration
- **File:** `lib/i18n.ts`
- **Languages:** English, Chinese
- **Features:** All UI strings, achievements, articles, AI prompts

### Key Features
- 60+ translation keys
- Language switcher in UI
- Language-specific fonts
- Language-specific AI prompts

---

## 🎨 Skill 7: Newspaper Design System

### Responsibility
Render vintage-style newspaper layouts with proper typography and styling.

### Input
```typescript
interface NewspaperInput {
  newspaper: SharedNewspaper;
  shareToken?: string;
  onReset?: () => void;
}
```

### Output
- **Component:** `Newspaper.tsx`
- **Formats:** Full newspaper view, WeChat Moments card view

### Integration
- **Fonts:** Courier Prime, Special Elite, IM Fell English, Noto Serif SC
- **Colors:** Real newsprint tones (year-shifted accents)
- **Layout:** 2-column justified text, drop caps, pull quotes

### Key Features
- Real paper texture
- Vintage typography
- Era-based color coding
- Polaroid photo frames
- Download as PNG
- View mode toggle (newspaper/card)

---

## 🔒 Skill 8: Security

### Responsibility
Protect the application from common security threats.

### Features
- **Input Sanitization:** XSS protection for all text inputs
- **SSRF Protection:** URL validation against allowlist
- **Rate Limiting:** 30 requests per minute per IP
- **API Key Security:** Server-side only API calls
- **Image CORS:** Remote images converted to base64

### Integration
- **File:** `lib/security.ts`
- **Middleware:** Applied to all API routes
- **Validation:** Input sanitization before AI calls

---

## 📊 Skill 9: Performance Optimization

### Responsibility
Optimize application performance and resource usage.

### Features
- **Photo Compression:** 400×500px JPEG at 0.7 quality (~50-100KB)
- **Image Base64 Conversion:** For sharing and caching
- **Local Development:** Bind to 0.0.0.0 for phone access
- **Async Generation:** Parallel article and image generation

### Integration
- **File:** `lib/storage.ts` (photo compression)
- **Form:** `app/form/page.tsx` (async generation)

---

> *"The future is not written yet — but we can give it a headline."*