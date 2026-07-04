# 📰 Future Time Capsule — AI Agent Guidelines

> *Built at TRAE Friends Zhengzhou Hackathon, July 2026*

---

## 🎯 Agent Roles

This project uses AI agents for three distinct tasks:

### 1. Journalist Agent (GLM-4-Flash)
**Responsibility:** Generate newspaper articles from user input

**Inputs:**
- Name
- Team
- Achievement
- Future date (year)
- Language (English/Chinese)

**Output Format:**
```json
{
  "headline": "Bold newspaper headline with team name",
  "paragraph1": "First paragraph (1-2 sentences)",
  "paragraph2": "Second paragraph (1-2 sentences)",
  "paragraph3": "Third paragraph (1-2 sentences)",
  "future_quote": "First-person quote from the person",
  "reward": "Short funny line about their lavish reward",
  "image_prompt": "English description of a scene for the achievement"
}
```

**Guidelines:**
- Keep paragraphs concise (1-2 sentences each)
- Make headlines dramatic and attention-grabbing
- Include team name in headline
- Write in the target language (English or Chinese)
- Image prompt should describe a scene without people/faces

---

### 2. Illustrator Agent (CogView-3-Flash)
**Responsibility:** Generate photorealistic newspaper illustrations

**Inputs:**
- Achievement text
- Image prompt from Journalist Agent

**Style Guidelines:**
- Vintage newspaper photo style
- Sepia tone
- Cinematic lighting
- Highly detailed
- Photorealistic
- No people, no faces
- News photography aesthetic

**Aspect Ratio:** 1024 × 576 (widescreen banner)

---

### 3. Achievement Generator Agent (GLM-4-Flash)
**Responsibility:** Generate creative achievement suggestions

**Inputs:**
- Category (tech, ai, money, time, all)
- Language (English/Chinese)

**Output Format:**
```json
{
  "achievements": ["Idea 1", "Idea 2", "Idea 3"]
}
```

**Guidelines:**
- 3 ideas per request
- Short (10-15 words each)
- Funny and creative
- Category-specific
- Write in the target language

---

## 🧠 AI Configuration

### Model Selection
| Task | Model | Cost | Speed |
|------|-------|------|-------|
| Article Generation | GLM-4-Flash | Paid (~0.01 RMB/request) | 3-8s |
| Image Generation | CogView-3-Flash | **FREE** | 5-10s |
| Achievement Generation | GLM-4-Flash | Paid (~0.01 RMB/request) | 2-5s |

### API Endpoints
- **Article:** `/api/generate-article` (POST)
- **Image:** `/api/generate-image` (POST)
- **Achievement:** `/api/generate-achievement` (POST)

---

## ⚠️ Error Handling

### Fallback System
When AI services are unavailable:
1. **Article Generation:** Use pre-built template articles (5 categories, bilingual)
2. **Image Generation:** Skip image entirely — newspaper renders without illustration
3. **Achievement Generation:** Use pre-defined achievement pools

### Rate Limiting
- 30 requests per minute per IP
- Return 429 status when limit exceeded

### Timeouts
- Article: 15s (Vercel), 30s (local)
- Image: 25s
- Achievement: 15s (Vercel), 30s (local)

---

## 🌐 Bilingual Support

### English
- Fonts: Courier Prime, Special Elite, IM Fell English
- Prompts and responses in English

### Chinese
- Fonts: Noto Serif SC
- Prompts and responses in Chinese
- Separate achievement pools for Chinese

### Switching Language
- UI strings change immediately
- Achievement suggestions regenerate in new language
- Newspaper articles regenerate in new language

---

## 🔒 Security

### Input Sanitization
- Remove HTML tags
- Escape special characters
- Limit length (2000 chars)

### SSRF Protection
- Validate URLs against allowlist
- Only allow known image CDNs

### API Key Security
- Store keys in environment variables
- Never expose to client-side code
- Server-side only API calls

---

## 📊 Performance Optimization

### Caching
- Local storage for user's past newspapers
- Share tokens cached server-side

### Image Optimization
- Compress user photos to 400×500px JPEG at 0.7 quality
- Convert remote images to base64 for sharing
- Use appropriate image formats

### Async Generation
- Article and image generation can run in parallel
- Show loading indicators to users

---

> *"We didn't build a time machine. We built a time capsule — one that asks AI to imagine who you'll become, and prints it on tomorrow's front page today."*