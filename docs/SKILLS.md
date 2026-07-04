# Skill Modules Documentation

## Overview

The Future Time Capsule application is organized into discrete skill modules, each encapsulating a specific capability with defined inputs, outputs, and integration points.

## Skill Architecture

Each skill module follows a consistent pattern:
1. **Input Interface**: Defines the parameters required to execute the skill
2. **Output Interface**: Defines the return structure of the skill
3. **Main Function**: Implements the core logic with fallback handling

---

## 1. Article Generation Skill

**File**: `lib/skills/article-generation.ts`

### Purpose
Generates newspaper articles from user input using AI (GLM-4-Flash) with fallback templates.

### Input

```typescript
interface ArticleGenerationInput {
  input: CapsuleInput; // User input with name, team, achievement, date, etc.
}
```

### Output

```typescript
interface ArticleGenerationOutput {
  article: ArticleData; // Complete article with headline, paragraphs, quote, reward, image_prompt
  provider: "glm" | "fallback"; // Source of the generated content
}
```

### Functions

| Function | Description |
|----------|-------------|
| `generateArticle(params)` | Generates a complete newspaper article |
| `generateAchievementList(params)` | Generates 3 funny achievement ideas |

### Integration Points

- **API Route**: `/api/generate-article`
- **API Route**: `/api/generate-achievement`
- **Fallback**: `lib/glm.ts` — `fallbackArticle()` and `ACHIEVEMENT_POOLS`

### AI Prompt Structure

System prompt instructs the model to:
- Write as a futuristic newspaper journalist
- Generate 7 required fields (headline, 3 paragraphs, quote, reward, image prompt)
- Keep content absurd, witty, and funny
- Return valid JSON without markdown

---

## 2. Image Generation Skill

**File**: `lib/skills/image-generation.ts`

### Purpose
Generates AI illustrations using CogView-3-Flash based on article prompts.

### Input

```typescript
interface ImageGenerationInput {
  prompt: string; // Image description for the AI
}
```

### Output

```typescript
interface ImageGenerationOutput {
  imageUrl: string; // URL to generated image (or empty string on failure)
  provider: "cogview" | "fallback"; // Source of the image
}
```

### Functions

| Function | Description |
|----------|-------------|
| `generateImage(params)` | Generates an image from a text prompt |

### Integration Points

- **API Route**: `/api/generate-image`
- **Image Prompt Source**: Article's `image_prompt` field from article generation

### Configuration

| Parameter | Value |
|-----------|-------|
| Model | cogview-3-flash |
| Size | 1024x1024 |
| API Base | `https://open.bigmodel.cn/api/paas/v4/images/generations` |

---

## 3. Sharing Skill

**File**: `lib/skills/sharing.ts`

### Purpose
Creates and retrieves shareable newspaper links with 9-character tokens.

### Inputs

```typescript
// Create Share
interface CreateShareInput {
  newspaper: SharedNewspaper; // Full newspaper data
}

// Get Share
interface GetShareInput {
  token: string; // 9-character share token
}
```

### Outputs

```typescript
// Create Share
interface CreateShareOutput {
  token: string; // Generated share token
}

// Get Share
interface GetShareOutput {
  newspaper: SharedNewspaper | null; // Retrieved newspaper or null
}
```

### Functions

| Function | Description |
|----------|-------------|
| `createShare(params)` | Creates a new share token and persists the newspaper |
| `retrieveShare(params)` | Retrieves a newspaper by share token |

### Integration Points

- **API Route**: `/api/share` (POST)
- **API Route**: `/api/share/[token]` (GET)
- **Database**: `lib/db.ts` — `makeToken()`, `saveShare()`, `getShare()`

### Token Properties

- 9 characters, base32 (alphanumeric lowercase)
- Expires after 30 days (Redis TTL or file-based storage)
- Remote images are converted to base64 for permanent storage

---

## 4. Capsule Management Skill

**File**: `lib/skills/capsule-management.ts`

### Purpose
Manages client-side storage of user's saved newspapers (capsules).

### Inputs

```typescript
// Create Capsule
interface CreateCapsuleInput {
  input: CapsuleInput; // User input data
  article: ArticleData; // Generated article
  photoDataUrl?: string; // Compressed user photo (base64)
  imageUrl?: string; // AI-generated illustration
}

// Save Capsule
interface SaveCapsuleInput {
  capsule: SharedNewspaper; // Full capsule to persist
}

// Remove Capsule
interface RemoveCapsuleInput {
  id: string; // Capsule ID to delete
}
```

### Outputs

```typescript
// Create Capsule
interface CreateCapsuleOutput {
  capsule: SharedNewspaper; // Newly created capsule with generated ID
}

// Save/Remove Capsule
interface SaveCapsuleOutput {
  capsules: SharedNewspaper[]; // Updated list of all capsules
}
```

### Functions

| Function | Description |
|----------|-------------|
| `createCapsule(params)` | Creates a new capsule with unique ID |
| `persistCapsule(params)` | Saves a capsule to localStorage |
| `deleteCapsule(params)` | Removes a capsule from localStorage |
| `fetchCapsules()` | Loads all saved capsules |

### Integration Points

- **Storage**: `lib/storage.ts` — `saveCapsule()`, `removeCapsule()`, `loadCapsules()`, `makeId()`
- **Form Component**: `components/CapsuleForm.tsx`
- **Gallery Component**: `components/CapsuleGallery.tsx`

### Storage Limits

- Maximum 20 capsules per user
- Photo compression: ~400x500 JPEG @ 0.7 quality (~50-100KB)
- Automatic quota fallback (see RULES.md)

---

## Skill Integration Flow

### Newspaper Creation Flow

1. **User fills form** → `CapsuleForm.tsx`
2. **Validate input** → `lib/rules.ts` — `validateCapsuleInput()`
3. **Generate article** → `lib/skills/article-generation.ts` — `generateArticle()`
4. **Generate image** → `lib/skills/image-generation.ts` — `generateImage()`
5. **Create capsule** → `lib/skills/capsule-management.ts` — `createCapsule()`
6. **Persist capsule** → `lib/skills/capsule-management.ts` — `persistCapsule()`
7. **Share (optional)** → `lib/skills/sharing.ts` — `createShare()`

### Share View Flow

1. **User visits share URL** → `/share/[token]/page.tsx`
2. **Validate token** → `lib/rules.ts` — `isValidShareToken()`
3. **Retrieve share** → `lib/skills/sharing.ts` — `retrieveShare()`
4. **Render newspaper** → `components/Newspaper.tsx`

---

## Error Handling Pattern

All skills follow a consistent error handling pattern:

1. **Graceful Degradation**: Each skill provides a fallback when primary service fails
2. **Provider Tracking**: Output includes `provider` field to identify source (AI vs fallback)
3. **Null/Empty Returns**: Skills return empty/null values instead of throwing exceptions
4. **Centralized Validation**: Input validation is handled by `lib/rules.ts`

---

## Extension Guidelines

When adding new skills:

1. Create a new file in `lib/skills/` following the naming convention
2. Define clear Input/Output interfaces
3. Implement core logic with fallback
4. Add validation rules to `lib/rules.ts` if needed
5. Update this documentation
6. Add integration points in relevant API routes