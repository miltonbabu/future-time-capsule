# 📰 Future Time Capsule — System Rules

> *Built at TRAE Friends Zhengzhou Hackathon, July 2026*

---

## 🎯 Overview

This document defines the business rules, validation criteria, and operational constraints for the Future Time Capsule application.

---

## ✅ Validation Rules

### User Input Validation

#### Name
- **Required:** Yes
- **Min Length:** 1 character
- **Max Length:** 50 characters
- **Allowed Characters:** Letters, spaces, accents, Chinese characters
- **Sanitization:** Strip HTML tags, escape special characters

#### Team
- **Required:** Yes
- **Min Length:** 1 character
- **Max Length:** 50 characters
- **Allowed Characters:** Letters, spaces, numbers, accents, Chinese characters
- **Sanitization:** Strip HTML tags, escape special characters

#### Achievement
- **Required:** Yes
- **Min Length:** 5 characters
- **Max Length:** 200 characters
- **Allowed Characters:** Letters, spaces, punctuation, numbers, Chinese characters
- **Sanitization:** Strip HTML tags, escape special characters

#### Future Date
- **Required:** Yes
- **Format:** ISO date string (YYYY-MM-DD)
- **Minimum:** Today's date + 1 year
- **Maximum:** Year 2100
- **Validation:** Must be a valid future date

#### Location
- **Required:** No
- **Default:** "Zhengzhou, China"
- **Max Length:** 100 characters
- **Sanitization:** Strip HTML tags, escape special characters

#### Photo
- **Required:** Yes
- **Format:** JPEG, PNG, WEBP, GIF
- **Max Size:** 10MB
- **Compression:** Resized to 400×500px, JPEG at 0.7 quality (~50-100KB)

#### Language
- **Required:** Yes
- **Options:** "en" (English), "zh" (Chinese)
- **Default:** "en"

#### Category
- **Required:** Yes
- **Options:** "tech", "ai", "money", "time", "all"
- **Default:** "all"

---

## 🧠 AI Generation Rules

### Article Generation

#### Success Criteria
- Returns valid JSON with all required fields
- Headline includes team name
- All text is in the requested language
- Paragraphs are 1-2 sentences each
- Image prompt is in English (for CogView compatibility)

#### Failure Handling
- If GLM API is unavailable: Use pre-built template articles
- If response is invalid JSON: Use pre-built template articles
- If response is empty: Use pre-built template articles
- If response exceeds length limits: Truncate appropriately

#### Template Selection
- Template selected by category (tech, ai, money, time, all)
- Templates are bilingual (English and Chinese)
- 5 template articles per category per language

### Image Generation

#### Success Criteria
- Returns a valid image URL
- URL passes security validation (SSRF protection)
- Image is accessible and not blocked by CORS

#### Failure Handling
- If CogView API is unavailable: Skip image entirely
- If response contains no valid URL: Skip image entirely
- If image fails to load: Skip image entirely
- No empty space or broken image placeholder

#### Prompt Construction
- Base prompt from article's image_prompt field
- Achievement text prepended for context
- Style suffix appended: "vintage newspaper photo style, sepia tone, cinematic lighting, highly detailed, photorealistic, no people no faces, news photography aesthetic"
- Maximum prompt length: 250 characters

### Achievement Generation

#### Success Criteria
- Returns exactly 3 achievement ideas
- Each idea is 10-15 words
- Ideas are in the requested language
- Ideas match the selected category

#### Failure Handling
- If GLM API is unavailable: Use pre-defined achievement pools
- If response is invalid: Use pre-defined achievement pools
- If fewer than 3 ideas: Fill remaining with pre-defined achievements

---

## 🔗 Sharing Rules

### Share Token Generation
- **Length:** 9 characters
- **Characters:** Alphanumeric (A-Z, a-z, 0-9)
- **Uniqueness:** Must be unique across all shares
- **Generation:** Cryptographically random

### Share Storage
- **Storage:** Upstash Redis (Vercel) / JSON files (local)
- **Expiry:** 30 days from creation
- **Data:** Full newspaper data including base64-encoded images

### Share Retrieval
- **Token:** 9-character token from URL
- **Validation:** Token must exist and not be expired
- **Data:** Return full newspaper data with images

### QR Code Generation
- **Content:** Share URL (https://future-is-here.vercel.app/share/{token})
- **Size:** 120×120 pixels
- **Level:** M (medium error correction)

---

## 💾 Local Storage Rules

### Storage Limits
- **Max Items:** 20 newspapers
- **Max Size:** 5MB (browser localStorage limit)
- **Quota:** Progressive fallback

### Progressive Quota Fallback
1. **Full:** Store with images (up to 20 items)
2. **Without Images:** If quota exceeded, store without images (up to 20 items)
3. **Current Only:** If still exceeded, only store the most recent newspaper

### Data Structure
- **Key:** `future-time-capsule-saved`
- **Format:** JSON array
- **Content:** Array of SharedNewspaper objects

### CRUD Operations

#### Create
- Add new newspaper to array
- Remove oldest if over limit
- Apply progressive quota fallback

#### Read
- Retrieve all saved newspapers
- Return in chronological order (newest first)

#### Update
- Not applicable (newspapers are immutable once generated)

#### Delete
- Remove specific newspaper by ID
- Maintain array order

---

## 🌐 Internationalization Rules

### Language Selection
- **Default:** English ("en")
- **Options:** English ("en"), Chinese ("zh")
- **Persistance:** Saved in localStorage as "future-time-capsule-lang"

### Translation Coverage
- **UI Strings:** 100% coverage
- **Achievements:** 100% coverage (separate pools per language)
- **Articles:** 100% coverage (AI generates in target language)
- **Templates:** 100% coverage (bilingual templates)

### Font Selection
- **English:** Courier Prime, Special Elite, IM Fell English
- **Chinese:** Noto Serif SC
- **Headlines:** Libre Caslon Display (English), Noto Serif SC (Chinese)

### Language Switching
- **UI:** Immediate switch
- **Achievements:** Regenerate in new language
- **Articles:** Must re-generate to change language
- **Existing Newspapers:** Language preserved at generation time

---

## 🔒 Security Rules

### Input Sanitization
- **All Text Fields:** Strip HTML tags, escape special characters
- **Maximum Length:** 2000 characters for all text inputs
- **Encoding:** UTF-8 only

### SSRF Protection
- **URL Validation:** Check against allowlist
- **Allowed Hosts:** Zhipu AI CDN, trusted image hosts
- **Blocked Protocols:** file://, ftp://, gopher://

### Rate Limiting
- **Limit:** 30 requests per minute per IP
- **Scope:** All API routes
- **Response:** 429 status code with "Too many requests" message

### API Key Security
- **Storage:** Environment variables only
- **Exposure:** Never expose to client-side code
- **Transmission:** HTTPS only

### Image Security
- **CORS:** Remote images converted to base64
- **Validation:** Check for valid image content
- **Size:** Limit processed images to reasonable dimensions

### XSS Protection
- **React:** Automatic escaping via JSX
- **Sanitization:** Custom sanitization for user-generated content
- **DOMPurify:** Not used (React provides sufficient protection)

---

## 📊 Performance Rules

### Photo Compression
- **Target Size:** 50-100KB
- **Dimensions:** 400×500px
- **Format:** JPEG
- **Quality:** 0.7

### Image Base64 Conversion
- **For Sharing:** Convert remote images to base64
- **For Storage:** Convert user photos to base64 after compression
- **Cache:** Cache converted images in localStorage

### Async Generation
- **Article:** Generated first (faster)
- **Image:** Generated after article (slower)
- **Parallel:** Can run in parallel for better performance
- **Loading:** Show step-by-step loading indicators

### Local Development
- **Host:** 0.0.0.0 (bind to all interfaces)
- **Port:** 3000
- **Phone Access:** Same WiFi network via PC IP address

---

## 🎨 Design Rules

### Color Scheme
- **Paper:** `#e8dcc8` (authentic newsprint)
- **Ink:** `#1a1510`
- **Accent:** `#6b1a1a`

### Era Theming
- **Near (2025-2030):** Deep red accent (#6b1a1a)
- **Mid (2031-2040):** Ink blue accent (#1a2458)
- **Far (2041+):** Burnt sienna accent (#8a5515)

### Typography
- **Headline:** "Libre Caslon Display", "Playfair Display", Georgia
- **Body:** "Courier Prime", "Special Elite", "IM Fell English"
- **Chinese:** "Noto Serif SC"
- **Weight:** Bold for headlines, regular for body

### Layout
- **Columns:** 2 columns for desktop, 1 column for mobile
- **Justification:** Justified text for newspaper body
- **Drop Cap:** First letter of first paragraph
- **Pull Quote:** Centered italic text with quotation marks

### Visual Effects
- **Paper Texture:** Real paper texture with dot grain
- **Sepia Filter:** Applied to photos and illustrations
- **3D Effects:** Subtle emboss/engrave for text
- **Polaroid Frame:** Matches paper color (not white)

---

## 🚀 Deployment Rules

### Environment Variables
- **Required:** GLM_API_KEY
- **Optional:** UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
- **Local:** .env.local file
- **Production:** Vercel environment variables

### Build Configuration
- **Framework:** Next.js 16 App Router
- **Build Command:** npm run build
- **Output:** .next directory
- **Root Directory:** future-time-capsule

### Vercel Configuration
- **Framework:** Next.js
- **Build Command:** npm run build
- **Output Directory:** .next
- **Environment:** Set GLM_API_KEY in Vercel dashboard

### Local Development
- **Command:** npm run dev
- **Host:** 0.0.0.0
- **Port:** 3000
- **Phone Access:** http://&lt;PC-IP&gt;:3000

---

## ⚠️ Error Handling Rules

### General Error Handling
- **User Feedback:** Clear, user-friendly error messages
- **Logging:** Console logging for debugging
- **Graceful Degradation:** Fallback to working alternatives

### API Error Handling
- **Timeouts:** Set appropriate timeouts (15-30s)
- **Retry:** No automatic retry (AI calls are expensive)
- **Fallback:** Use pre-built templates when AI fails

### Storage Error Handling
- **Quota Exceeded:** Apply progressive fallback
- **Corrupted Data:** Clear and start fresh
- **Browser Support:** Warn users without localStorage

### Image Error Handling
- **Failed Load:** Skip image entirely
- **Invalid Format:** Reject with error message
- **CORS Issues:** Convert to base64 before display

---

> *"The future is not written yet — but we can give it a headline."*