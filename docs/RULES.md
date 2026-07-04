# System Rules Documentation

## Overview

This document outlines all business rules, validation criteria, and operational constraints for The Future Time Capsule application. All rules are implemented in `lib/rules.ts` and enforced throughout the application.

## Field Validation Rules

### Required Fields

| Field | Min Length | Max Length | Pattern | Required |
|-------|-----------|------------|---------|----------|
| name | 1 | 60 | Letters, numbers, spaces, basic punctuation | Yes |
| team | 1 | 60 | Letters, numbers, spaces, basic punctuation | Yes |
| achievement | 1 | 500 | None | Yes |
| futureDate | - | - | Valid ISO date in the future | Yes |
| language | - | - | "en" or "zh" | Yes |
| category | - | - | "tech", "ai", "money", "time", "all" | Yes |
| location | 1 | 100 | Letters, numbers, spaces, basic punctuation | No |
| memory | - | 500 | None | No |

### Date Validation

- Must be a valid ISO date string (YYYY-MM-DD)
- Must be a date in the future (after today)
- Cannot be today or a past date

### Language Validation

- Only "en" (English) and "zh" (Chinese) are supported
- Invalid language defaults to "en"

### Category Validation

Valid categories:
- `tech` - Tech & Coding
- `ai` - AI Mayhem
- `money` - Money & Startups
- `time` - Time & Chaos
- `all` - General (default)

## Rate Limiting Rules

| Rule | Value | Description |
|------|-------|-------------|
| WINDOW_MS | 60,000 (1 minute) | Rolling window duration |
| MAX_REQUESTS | 30 | Maximum requests per window |

Rate limiting is IP-based and implemented in-memory. Resets on serverless cold start (acceptable for hackathon scale).

## Storage Rules

### Capsules

| Rule | Value | Description |
|------|-------|-------------|
| MAX_CAPSULES | 20 | Maximum saved capsules per user |

### Photo Compression

| Rule | Value | Description |
|------|-------|-------------|
| MAX_PHOTO_WIDTH | 400px | Maximum photo width |
| MAX_PHOTO_HEIGHT | 500px | Maximum photo height |
| PHOTO_QUALITY | 0.7 | JPEG quality factor |

### Quota Fallback Strategy

When localStorage quota is exceeded:
1. **Tier 1**: Full payload (photos + all data)
2. **Tier 2**: Without images (photoDataUrl and imageUrl removed)
3. **Tier 3**: Current only (most recent capsule only)

## Sharing Rules

| Rule | Value | Description |
|------|-------|-------------|
| TOKEN_LENGTH | 9 characters | Share token length |
| TOKEN_PATTERN | `^[a-z0-9]{9}$` | Base32 URL-friendly characters |
| TTL_SECONDS | 2,592,000 (30 days) | Token expiration time |

### Share Token Generation

- Uses `crypto.getRandomValues` for cryptographic randomness
- Base32 alphabet: `abcdefghijklmnopqrstuvwxyz0123456789`

### Image Persistence

Remote image URLs (CogView) are converted to base64 on share creation to ensure permanent availability (CogView URLs expire).

## Security Rules

### Input Sanitization

All text fields are sanitized to:
- Remove `<script>`, `<style>`, `<iframe>` tags
- Collapse multiple whitespace into single spaces
- Trim leading/trailing whitespace
- Cap length at maximum allowed

### SSRF Protection

External URLs are validated to block:
- Non-HTTP/HTTPS protocols
- localhost (127.0.0.1)
- Private IP ranges (10.x, 172.16-31.x, 192.168.x)
- `.local` domains

## AI Generation Rules

### Timeout Settings

| Environment | Timeout |
|-------------|---------|
| Vercel (serverless) | 5 seconds |
| Self-hosted/local | 30 seconds |

### Fallback Strategy

When AI generation fails (timeout, API error, or invalid response):
- Article: Uses pre-built templates from `lib/glm.ts`
- Achievements: Uses pre-defined pools from `lib/achievements.ts`
- Images: Returns empty string (no illustration)

## Newspaper Display Rules

### Era Color Coding

| Era | Years | Accent Color |
|-----|-------|--------------|
| near | 2030 and earlier | Warm orange |
| mid | 2031-2040 | Cool blue |
| far | 2041 and later | Deep purple |

### Default Values

| Field | Default |
|-------|---------|
| location | "Zhengzhou, China" |
| price | "PRICE 1 FUTURE-COIN" |
| futureDate | Current date + 10 years |

## Error Handling Rules

### Validation Errors

- Validation occurs on form blur (per-field) and on submit (all fields)
- Error messages are bilingual (English/Chinese)
- First error is displayed as a summary, all field errors are shown inline

### API Errors

- 400: Invalid input or missing data
- 429: Rate limit exceeded
- 500: Server error (handled gracefully with fallbacks)