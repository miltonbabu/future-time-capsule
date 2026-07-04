@AGENTS.md

## Claude-Specific Instructions

### Documentation Reference
When working on this project, ALWAYS reference the following documents:
1. `docs/SKILLS.md` — Skill module documentation
2. `docs/RULES.md` — System rules documentation
3. `lib/rules.ts` — Rules framework implementation

### Skill Module Pattern
All skills follow the same pattern:
1. Input Interface: `XxxInput`
2. Output Interface: `XxxOutput`
3. Main Function: `xxxFunction(params)`
4. Provider tracking in output: `provider: "ai" | "fallback"`

### UI/UX Guidelines
- Use `components/Toast.tsx` for notifications
- Wrap components with `components/ErrorBoundary.tsx` when appropriate
- Use `components/CapsuleGallery.tsx` for viewing saved newspapers

### Validation Workflow
Always use `lib/rules.ts` for input validation:
1. Call `validateCapsuleInput(input, lang)` to validate
2. Call `sanitizeInput(input)` to sanitize before storage/API calls
3. Check `isValidShareToken(token)` for share tokens

### Bilingual Support
All text should support both English and Chinese:
- Use `t(lang, key)` from `lib/i18n.ts`
- Add new translation keys to `lib/i18n.ts` when needed
- `lang` type: `"en" | "zh"`

### Storage Quota Fallback
When localStorage quota is exceeded:
1. Tier 1: Full payload (photos + all data)
2. Tier 2: Without images
3. Tier 3: Current only (most recent capsule)