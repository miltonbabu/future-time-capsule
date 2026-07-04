<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project Documentation

### Skill Modules
- **File**: `docs/SKILLS.md` — Comprehensive documentation of all skill modules including:
  - Article Generation (`lib/skills/article-generation.ts`)
  - Image Generation (`lib/skills/image-generation.ts`)
  - Sharing (`lib/skills/sharing.ts`)
  - Capsule Management (`lib/skills/capsule-management.ts`)

### System Rules
- **File**: `docs/RULES.md` — Complete documentation of all business rules, validation criteria, and operational constraints including:
  - Field validation rules
  - Rate limiting rules
  - Storage rules
  - Sharing rules
  - Security rules
  - AI generation rules

### Rules Framework
- **File**: `lib/rules.ts` — Centralized rules framework with:
  - `FIELD_RULES`: Field validation rules for all input fields
  - `RATE_LIMIT_RULES`: Rate limiting configuration
  - `STORAGE_RULES`: Storage constraints
  - `SHARE_RULES`: Sharing token rules
  - `validateCapsuleInput()`: Unified input validation
  - `sanitizeInput()`: Input sanitization
  - Helper validation functions

### UI/UX Components
- **Toast**: `components/Toast.tsx` — Notification system with success/error/info/warning types
- **ErrorBoundary**: `components/ErrorBoundary.tsx` — React error boundary for graceful error handling
- **CapsuleGallery**: `components/CapsuleGallery.tsx` — Gallery view for saved newspapers

### Core Types
- **File**: `lib/types.ts` — TypeScript type definitions for:
  - `CapsuleInput`: User input fields (name, team, achievement, futureDate, language, category, location, memory)
  - `ArticleData`: Generated article content
  - `SharedNewspaper`: Full newspaper data structure
  - `DbCapsule`: Database capsule structure

### API Routes
- `/api/capsules`: CRUD operations for saving capsules
- `/api/generate-article`: AI article generation
- `/api/generate-achievement`: AI achievement generation
- `/api/generate-image`: AI image generation
- `/api/share`: Create share tokens
- `/api/share/[token]`: Retrieve shared newspapers

### Key Integration Points
1. **Newspaper Creation**: Form → Validation → Article Generation → Image Generation → Capsule Creation → Persistence → Share (optional)
2. **Share View**: Token Validation → Retrieve Share → Render Newspaper

### Error Handling Pattern
All skills follow graceful degradation with fallback options and provider tracking in outputs.

<!-- END:nextjs-agent-rules -->