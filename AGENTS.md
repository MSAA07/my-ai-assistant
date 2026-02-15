# AI Study Assistant - Agent Guidelines

## 1. Project Overview & Tech Stack

**Application**: Full-stack study assistant for uploading documents (PDF, DOCX) to generate AI summaries, flashcards, and exams.
**Architecture**: Monorepo-style with separate frontend and backend directories.
**Deployment Status**:
*   ✅ **Frontend**: Deployed on Vercel (`https://my-ai-assistant-ypzx.vercel.app`)
*   ✅ **Backend**: Deployed on Railway (`https://ai-assistant-backend-production-ddf0.up.railway.app`)

| Component | Tech Stack |
|-----------|------------|
| **Frontend** | Svelte 4, Vite 5, JavaScript (ESM), CSS Variables (Dark Theme), better-auth |
| **Backend** | Node.js, Express.js, PostgreSQL (Prisma ORM), OpenAI API |
| **Database** | PostgreSQL with Prisma Schema (User, Document, ExamAttempt) |

---

## 2. Build & Development Commands

### Frontend (`/my-ai-assistant`)
*   **Install**: `npm install`
*   **Dev Server**: `npm run dev` (Runs on `http://localhost:5173`)
*   **Build**: `npm run build` (Outputs to `dist/`)
*   **Preview**: `npm run preview`

### Backend (`/ai-assistant-backend`)
*   **Install**: `npm install`
*   **Start**: `node server.js` (Runs on `http://localhost:3001`)
*   **Database Sync**: `npx prisma db push` (Sync schema without migrations)
*   **Database GUI**: `npx prisma studio`

### Testing & Linting
*   **Current Status**: ❌ No testing or linting framework is currently configured.
*   **Recommended**:
    *   **Unit Tests**: Use `vitest` for Svelte components.
    *   **Backend Tests**: Use `jest` or `supertest` for API endpoints.
    *   **Linting**: Use `eslint` + `prettier`.

---

## 3. Code Style Guidelines

### General JavaScript
*   **Type**: Use **ES Modules** (`import`/`export`) exclusively.
*   **Variables**: Prefer `const` over `let`. Avoid `var`.
*   **Async**: Use `async`/`await` for all asynchronous operations.
*   **Imports**: strict ordering:
    1.  External dependencies (e.g., `svelte`, `marked`)
    2.  Internal Components (`./components/Header.svelte`)
    3.  Stores/Utils (`./stores/router.js`, `./stores/auth.js`)
    4.  Styles (`./styles/global.css`)
*   **File Extensions**: **ALWAYS** include `.js` extension for local imports (e.g., `import { router } from './router.js'`).

### Svelte Components
*   **Structure**: `<script>` -> Template (HTML) -> `<style>`
*   **Naming**: PascalCase for files and components (e.g., `DocumentView.svelte`).
*   **Reactivity**: Use `$: ` for derived state, but prefer event-driven updates where possible.
*   **Scoped Styles**: Default behavior. Do not use `<style global>` unless absolutely necessary.

```svelte
<script>
  import { onMount } from 'svelte';
  import Button from './Button.svelte'; // Local import
  
  export let title = 'Default Title';
</script>

<div class="card">
  <h2>{title}</h2>
  <slot />
</div>

<style>
  .card {
    background: var(--color-surface); /* Use CSS variables */
    padding: 1rem;
  }
</style>
```

### CSS & Theming
*   **Theme**: Dark Navy Theme. Use CSS variables from `src/styles/global.css`.
*   **Variables**:
    *   `--color-bg`: `#0a0e27` (Main background)
    *   `--color-surface`: `#111840` (Cards/Modals)
    *   `--color-accent`: `#60a5fa` (Primary actions)
    *   `--color-text`: `#f1f5f9` (Primary text)
*   **Responsive**: Mobile-first approach. Breakpoints at `640px` and `768px`.

### Backend & API
*   **Structure**: `server.js` handles all routes. Keep logic modular if refactoring.
*   **Database**: Use `prisma` client for all DB operations.
*   **Error Handling**: Wrap **ALL** async route handlers in `try/catch`.
    *   Log errors with `console.error`.
    *   Return JSON error responses: `res.status(500).json({ error: 'Message' })`.

```javascript
// Example Route Handler
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    // ... process file ...
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## 4. Agent Operational Rules

1.  **Safety First**: Never commit secrets (API keys, .env). Always use environment variables.
2.  **Path Resolution**: Always use **absolute paths** when reading/writing files.
    *   Root: `C:/Users/Saudp/projects/`
    *   Frontend: `.../my-ai-assistant/`
    *   Backend: `.../ai-assistant-backend/`
3.  **Verification**: After making changes, verify by checking for syntax errors or running the relevant build command (`npm run build`).
4.  **No Hallucinations**: Do not reference scripts (`npm run test`) or files (`tsconfig.json`) that do not exist.
5.  **Documentation**: When adding new features, update this `AGENTS.md` file.
6.  **Admin Dashboard**:
    *   Admin UI lives in `src/components/admin/` and is rendered by `src/components/AdminDashboard.svelte`.
    *   Admin data is fetched from `/api/admin/*` endpoints with `credentials: "include"`.

---

## 5. Environment Configuration

Ensure `.env` exists in both root directories with:

**Backend (`ai-assistant-backend/.env`)**
```ini
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"
OPENAI_API_KEY="sk-..."
PORT=3001
```

**Frontend** works with the backend at:
*   **Local**: `http://localhost:3001`
*   **Production**: `VITE_API_BASE_URL` (Set in Vercel to Railway URL)
