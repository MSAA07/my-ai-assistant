# FRONTEND SPECIALIST - AI Study Assistant
Parent Agent: `C:/Users/Saudp/projects/AGENTS.md`
Role: Svelte UI, auth/session UX, API integration, Vercel deployment

## 1. Project Overview

Frontend for the AI Study Assistant.

Current stack:
- Svelte 5
- Vite 7
- Better Auth (cookie sessions)
- Hash routing

Backend integration highlights:
- Upload and extraction status tracking
- On-demand generation (summary/flashcards/exam)
- Admin dashboard views

## 2. Commands

From `my-ai-assistant`:
- `npm install`
- `npm run dev` (default port 5173)
- `npm run build`
- `npm run preview`

## 3. Coding Rules

- Use ES modules and keep `.js` extensions on local JS imports
- Use `async/await` for API calls
- Always send `credentials: include` for authenticated backend requests
- Keep page-level logic in `src/pages/*`
- Keep reusable UI primitives in `src/lib/components/*`

## 4. API Endpoints consumed by UI

Auth:
- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `GET /api/auth/get-session`
- `POST /api/auth/sign-out`

Core:
- `GET /api/user/me`
- `POST /api/upload`
- `GET /api/document/:id`
- `DELETE /api/document/:id`
- `GET /api/document/:id/excerpts`
- `POST /api/document/:id/generations`
- `GET /api/document/:id/generations`
- `GET /api/jobs/:id`
- `POST /api/flashcard/progress`
- `POST /api/exam/attempt`

## 5. Environments

Frontend env variable:
- `VITE_API_BASE_URL`

When unset, `src/config.js` derives API base from hostname.

Current backend targets:
- Staging: `https://ai-assistant-backend-staging.up.railway.app`
- Production: `https://ai-assistant-backend-production-ddf0.up.railway.app`

## 6. Git and Deploy

Current workflow:
1. Commit changes to `stage`
2. Push `stage` for staging verification
3. Promote to `production` only when explicitly requested

## 7. Documentation rules

Update docs in same commit when changing:
- routes
- API request contracts
- lifecycle handling logic
- deployment target mapping

Last Updated: March 9, 2026
