# 📰 Future Time Capsule

> *"We didn't build a time machine. We built a time capsule — one that asks AI to imagine who you'll become, and prints it on tomorrow's front page today."*

---

## 🏆 TRAE Friends Zhengzhou Hackathon — July 2026

**Live Demo:** [future-is-here.vercel.app](https://future-is-here.vercel.app)

**Local Development:** `npm run dev` → http://localhost:3000

**Phone Access (same WiFi):** http://&lt;your-PC-IP&gt;:3000

---

## 🎯 The Pitch (30 Seconds)

What if you could peek into the future and see tomorrow's newspaper — with **YOU** on the front page?

That's Future Time Capsule. You type your name, your team, and a wild future achievement. You upload a photo. And in seconds, AI writes a full vintage newspaper front page from the year 2032 — complete with a witty article, a photorealistic illustration, your photo in a sepia polaroid frame, and a QR code to share it with the world.

It's part time machine. Part creativity engine. Part newspaper press. All powered by AI.

---

## 🎨 What It Does

### Demo Flow

1. **Landing Page** — A classic broadsheet masthead greets you. "THE FUTURE TIMES." A QR code and "Enter the Press" button invite you in.

2. **The Form** — Enter your name, team, and a future achievement. Not sure what to write? Hit "Surprise Me" — AI generates funny, category-specific achievements for you. Pick a date in the future. Upload a photo (camera or gallery). Choose English or Chinese.

3. **The Magic** — Hit generate. In the background:
   - GLM-4-Flash writes a full newspaper article — headline, three paragraphs, a first-person quote, and a reward line
   - CogView-3-Flash (free) generates a photorealistic illustration — no faces, just the scene, in sepia tones
   - Your photo gets a polaroid frame with a vintage sepia filter
   - A share token is created server-side so anyone can view your newspaper via QR code

4. **The Newspaper** — A full broadsheet front page renders. Real paper texture. Drop cap. Justified columns. Pull quote. Your photo. AI illustration. A QR code that links to your newspaper. A "Copy Link" button. A "Download as PNG" button.

5. **Share It** — Scan the QR code with your phone. Open the link. The full newspaper — with all images — loads for anyone, anywhere.

6. **Archive** — Every newspaper you create is saved locally. Click "My Newspapers" to browse, reopen, or delete your collection.

---

## 💡 The Problem (Why We Built This)

At every hackathon, people build incredible things. But the moment ends. The code goes to GitHub. The demo fades. The excitement dies.

We wanted to capture that moment — to freeze it in time, like a newspaper clipping you'd find in an attic decades later. A tangible, shareable, beautiful artifact that says: *"Here's who you became. Here's what you achieved. Here's your front page."*

And we wanted it to feel real. Not a generic AI text dump. A real newspaper — with typography, texture, columns, a polaroid photo, an illustration, a masthead. Something you'd want to print and frame.

---

## 🛠️ How We Built It

### Architecture

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 App Router with Turbopack |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS |
| AI | Zhipu GLM (GLM-4-Flash + CogView-3-Flash) |
| Database | Upstash Redis (Vercel) / JSON files (local) |
| Storage | localStorage (client) |

### The Hard Problems We Solved

1. **Making image generation cost-effective** — Initially used paid CogView-3-Plus (~0.5 RMB/image). Switched to free CogView-3-Flash (~3-5s generation) — same endpoint, zero cost. Moved generation to server-side API route for security.

2. **Sharing newspapers with images is hard** — Base64-encoded newspaper data in URL hashes exceeded QR code capacity. Built server-side share tokens — a 9-character code that stores the full newspaper (article + images + metadata). The QR code encodes a short URL.

3. **Photos disappeared on refresh** — Full-resolution photos exceeded localStorage's 5MB limit. Compressed photos to 400×500px JPEG at 0.7 quality (~50-100KB) via canvas before storing.

4. **AI should fail gracefully** — If GLM is down, the newspaper still generates — with pre-built template articles (5 categories, bilingual). If image generation fails, the newspaper shows without an illustration (no empty slot).

5. **It should work on your phone — without deploying** — Bound the dev server to 0.0.0.0. Run npm start on your PC, open http://&lt;your-PC-IP&gt;:3000 on your phone (same WiFi).

6. **Bilingual from day one** — Every UI string, achievement, newspaper article, and AI prompt supports English and Chinese. Different fonts for each language — Courier Prime/Special Elite for English, Noto Serif SC for Chinese.

---

## 🌈 The Design

- **Real paper texture** with dot grain — not synthetic CSS gradients
- **Three font systems**: newspaper (Courier Prime + Special Elite), landing (Libre Caslon + Lora), Chinese (Noto Serif SC)
- **Year-shifted color accents**: deep red for near future (2025-2030), ink blue for mid (2031-2040), aged gold for far (2041+)
- **Polaroid frame** matches the paper color, not white — looks like a photo taped into an old newspaper

---

## 🧠 Why GLM?

We chose Zhipu's GLM as our AI backbone for three reasons:

1. **Accessible in China** — OpenAI's API is unreachable from Chinese networks. GLM works reliably.
2. **Fast** — GLM-4-Flash responds in 3-8 seconds for article generation. Perfect for a live demo.
3. **CogView-3-Flash (free)** generates photorealistic images — not illustrations, not art. Actual photo-like scenes that look like they belong in a vintage newspaper.

---

## ✨ What Makes This Special

- 🎨 **It's not a chatbot** — It's a creative artifact generator. You fill a form and get a finished product.
- 🌐 **It's bilingual** — Real bilingual — not Google Translate. The AI writes native-quality articles in both languages.
- 🔗 **It's shareable** — QR codes, share links, PNG downloads. Your newspaper can go anywhere.
- 🛡️ **It's resilient** — AI fails? Templates kick in. Image fails? Newspaper still renders. Network fails? localStorage keeps your history.
- 📜 **It's beautiful** — Real paper texture. Vintage typography. Sepia tones. Drop caps. Polaroid frames.
- 📱 **It works offline-ish** — Run it on your laptop. Access from your phone. No deployment needed.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- GLM API key (from Zhipu AI)

### Installation

```bash
# Clone the repository
git clone https://github.com/miltonbabu/future-time-capsule.git
cd future-time-capsule

# Install dependencies
npm install

# Create environment variables
cp .env.local.example .env.local
```

### Environment Variables

```env
GLM_API_KEY=your-glm-api-key-here
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
```

### Running the App

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start
```

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
│   ├── Newspaper.tsx       # Newspaper layout component
│   ├── ShareCard.tsx       # WeChat Moments-style share card
│   └── Landing.tsx         # Landing page component
├── lib/                    # Utility libraries
│   ├── db.ts               # Redis database utilities
│   ├── glm.ts              # GLM/CogView API integration
│   ├── i18n.ts             # Internationalization
│   ├── storage.ts          # Local storage utilities
│   └── types.ts            # TypeScript type definitions
├── docs/                   # Documentation
│   ├── RULES.md            # System rules documentation
│   └── SKILLS.md           # Skill modules documentation
└── public/                 # Static assets
```

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

---

## 📄 License

MIT License — Feel free to use, modify, and share!

---

## 👥 The Team

Built at **TRAE Friends Zhengzhou** — a hackathon about friendship, creativity, and building the future together.

> *We came for the pizza. We stayed for the newspaper.*

---

![Future Time Capsule Banner](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20newspaper%20front%20page%20with%20futuristic%20headlines%20sepia%20tone%20retro%20style%20no%20people&image_size=landscape_16_9)