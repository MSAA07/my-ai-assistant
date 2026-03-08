# AI Study Assistant Frontend

Svelte + Vite frontend for the AI Study Assistant. The UI uploads study documents, tracks document-owned processing state, and renders summaries, flashcards, and exam questions returned by the backend.

## Lifecycle Model

The frontend treats the `Document` record as the source of truth for processing state.

- `queued`
- `processing`
- `complete`
- `failed`

`/api/jobs/:id` is still polled for worker progress, but list and detail views both rely on `Document.processingStatus`, `processingJobId`, `processingError`, and `processedAt`.

## Key Frontend Flows

- Upload a PDF, DOCX, or PPTX with `POST /api/upload`
- Refresh safely while processing by reloading `GET /api/document/:id`
- Keep the dashboard list in sync with `GET /api/user/me`
- Open a document directly and render finalized study materials after `complete`

## Backend Endpoints Used by the UI

- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `GET /api/auth/get-session`
- `POST /api/auth/sign-out`
- `GET /api/user/me`
- `POST /api/upload`
- `GET /api/document/:id`
- `GET /api/jobs/:id`
- `DELETE /api/document/:id`
- `POST /api/flashcard/progress`
- `POST /api/exam/attempt`

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the built app locally:

```bash
npm run preview
```

## Environment

- `VITE_API_BASE_URL`
  Optional explicit backend base URL.

If `VITE_API_BASE_URL` is not set, the frontend derives a safe fallback from the current hostname:

- local development -> `http://localhost:3001`
- Vercel preview/stage deployments -> Railway staging backend
- Vercel production deployments -> Railway production backend

## Deployment

- `stage` auto-deploys to Vercel preview
- `production` auto-deploys to Vercel production

The frontend expects the backend worker lifecycle to be stable before production promotion, including worker leases, stale-job recovery, and document/list detail consistency across refreshes.
