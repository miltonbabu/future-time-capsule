# 📰 Future Time Capsule — Claude Guidelines

> *Built at TRAE Friends Zhengzhou Hackathon, July 2026*

---

## 🎯 Project Overview

Future Time Capsule is a whimsical web application that generates vintage-style newspapers from the future based on user input. Users type their name, team, and a future achievement, upload a photo, and AI generates a complete newspaper front page.

**Key Features:**
- AI-generated newspaper articles (GLM-4-Flash)
- AI illustrations (CogView-3-Flash, free)
- Bilingual support (English/Chinese)
- Shareable links with QR codes
- Local storage archive
- Real paper texture design

---

## 🧠 AI Workflow

### Article Generation
- **Endpoint:** `/api/generate-article`
- **Model:** GLM-4-Flash
- **Output:** JSON with headline, paragraph1-3, future_quote, reward, image_prompt

### Image Generation
- **Endpoint:** `/api/generate-image`
- **Model:** CogView-3-Flash (free)
- **Prompt:** Achievement + image_prompt + style suffix
- **Style:** "vintage newspaper photo style, sepia tone, cinematic lighting, photorealistic, no people"

### Achievement Generation
- **Endpoint:** `/api/generate-achievement`
- **Model:** GLM-4-Flash
- **Categories:** tech, ai, money, time, all
- **Output:** 3 short, witty achievement ideas

---

## 🛠️ Development Guidelines

### Running the App
```bash
npm run dev    # Development
npm run build  # Production build
npm run start  # Production server
```

### Environment Variables
```env
GLM_API_KEY=your-glm-api-key-here
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
```

---

## 🎨 Design System

### Color Palette
- **Paper:** `#e8dcc8` (authentic newsprint)
- **Ink:** `#1a1510`
- **Accent:** `#6b1a1a`

### Fonts
- **Headline:** "Libre Caslon Display", "Playfair Display", Georgia
- **Body:** "Courier Prime", "Special Elite", "IM Fell English"
- **Chinese:** "Noto Serif SC"

### Era Theming
- **Near (2025-2030):** Deep red accent
- **Mid (2031-2040):** Ink blue accent
- **Far (2041+):** Burnt sienna accent

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page |
| `app/form/page.tsx` | Creation form |
| `app/share/[token]/page.tsx` | Shared newspaper view |
| `components/Newspaper.tsx` | Newspaper layout |
| `components/ShareCard.tsx` | WeChat Moments card |
| `lib/glm.ts` | GLM API integration |
| `lib/i18n.ts` | Internationalization |
| `lib/db.ts` | Database utilities |

---

## 🔒 Security Rules

1. **Input Sanitization:** All user inputs must be sanitized against XSS
2. **API Keys:** Never expose GLM API key to client
3. **Rate Limiting:** 30 requests per minute per IP
4. **URL Validation:** Validate all external URLs before fetching
5. **Image CORS:** Convert remote images to base64 for sharing

---

## 🚀 Deployment

- **Vercel:** Deploy directly from GitHub
- **Root Directory:** `future-time-capsule`
- **Environment:** Set GLM_API_KEY and Redis variables in Vercel dashboard

---

> *"The future is not written yet — but we can give it a headline."*