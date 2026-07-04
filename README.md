# 📰 THE FUTURE TIME CAPSULE

> *"Type your name. Pick a future date. Tell us the achievement you haven't achieved yet. Our AI journalist will write you a full front-page newspaper from that future year."*

---

## 🎯 What Is This?

The Future Time Capsule is a whimsical web application that generates **vintage-style newspapers** from the future based on your dreams and aspirations. It's like sending a letter to your future self, but with way more flair — complete with:

- 🎭 AI-generated newspaper headlines and articles
- 🖼️ Sepia-toned AI illustrations
- 💬 Memorable quotes from your future self
- 🏆 Lavish rewards for your achievements
- 📍 Location and memory tracking
- 🔗 Shareable links with QR codes

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **AI Journalism** | GLM-4-Flash generates witty, absurd newspaper articles |
| **AI Illustrations** | CogView-3-Flash creates vintage-style illustrations |
| **Bilingual Support** | English and Chinese language options |
| **Era Theming** | Color-coded newspapers based on future era (near/mid/far) |
| **Location Tracking** | Add your location (default: Zhengzhou, China) |
| **Memory Journal** | Record special memories to accompany your achievement |
| **Share System** | Generate shareable links with 30-day validity |
| **Local Storage** | Save up to 20 capsules for personal archive |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys for:
  - GLM-4-Flash (article generation)
  - CogView-3-Flash (image generation)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd future-time-capsule

# Install dependencies
npm install
# or
yarn install

# Create environment variables
cp .env.local.example .env.local
```

### Environment Variables

Edit `.env.local` with your API keys:

```env
GLM_API_KEY=your-glm-api-key-here
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
```

### Running the App

```bash
# Development mode
npm run dev
# or
yarn dev

# Production build
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
future-time-capsule/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── capsules/       # Capsule CRUD operations
│   │   ├── generate-*/     # AI generation endpoints
│   │   └── share/          # Share token management
│   ├── form/               # Newspaper creation form
│   ├── share/[token]/      # Shared newspaper view
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── CapsuleForm.tsx     # Input form with validation
│   ├── CapsuleGallery.tsx  # Saved newspapers gallery
│   ├── ErrorBoundary.tsx   # Error handling component
│   ├── Newspaper.tsx       # Newspaper layout component
│   └── Toast.tsx           # Notification system
├── lib/                    # Utility libraries
│   ├── skills/             # Skill modules
│   │   ├── article-generation.ts
│   │   ├── capsule-management.ts
│   │   ├── image-generation.ts
│   │   └── sharing.ts
│   ├── achievements.ts     # Achievement pools
│   ├── db.ts               # Redis database utilities
│   ├── glm.ts              # GLM/CogView API integration
│   ├── i18n.ts             # Internationalization
│   ├── rules.ts            # Validation and business rules
│   ├── security.ts         # Security utilities
│   ├── storage.ts          # Local storage utilities
│   └── types.ts            # TypeScript type definitions
├── docs/                   # Documentation
│   ├── RULES.md            # System rules documentation
│   └── SKILLS.md           # Skill modules documentation
└── public/                 # Static assets
```

---

## 🧠 AI Features

### Article Generation

Our AI journalist creates articles with:
- Bold, attention-grabbing headlines
- Dramatic opening paragraphs
- Witty quotes from your future self
- Lavish, funny rewards

### Image Generation

CogView-3-Flash generates:
- Photorealistic sepia illustrations
- Newspaper-style visuals
- No faces/privacy concerns

### Fallback System

When AI services are unavailable, the app gracefully falls back to:
- Pre-built article templates
- Pre-defined achievement pools
- No-image mode

---

## 📜 Newspaper Categories

| Category | Theme |
|----------|-------|
| 🤖 Tech | Coding, programming, tech innovations |
| 🧠 AI | Artificial intelligence, machine learning |
| 💰 Money | Startups, business, wealth |
| ⏳ Time | Temporal, philosophical, chaos |
| 🗞️ All | General, mixed topics |

---

## 🔒 Security

- **Input Sanitization**: All text fields sanitized against XSS
- **SSRF Protection**: External URL validation
- **Rate Limiting**: 30 requests per minute
- **Image Persistence**: Remote images converted to base64 on share

---

## 📝 Documentation

- [System Rules](docs/RULES.md) — Business rules and validation criteria
- [Skill Modules](docs/SKILLS.md) — Detailed skill documentation
- [AGENTS.md](AGENTS.md) — AI agent guidelines
- [CLAUDE.md](CLAUDE.md) — Claude-specific instructions

---

## 🎨 Design Philosophy

The Future Time Capsule embraces a **vintage newspaper aesthetic**:

- **Typography**: Typewriter fonts (Courier Prime), serif headlines
- **Color Scheme**: Warm off-white paper, deep ink colors, vintage textures
- **Visuals**: Sepia photos, 3D paper cards, era-based color coding
- **Interactions**: Smooth animations, toast notifications, error boundaries

---

## 📄 License

MIT License — Feel free to use, modify, and share!

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

> *"The future is not written yet — but we can give it a headline."*
>
> — The Future Time Capsule Team

---

![The Future Time Capsule](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20newspaper%20front%20page%20with%20futuristic%20headlines%20sepia%20tone%20retro%20style&image_size=landscape_16_9)