# AI Study Assistant - Agent Guidelines

## 1. Project Overview

Full-stack study assistant for uploading documents (PDF, DOCX) to generate AI summaries, flashcards, and exams.

| Component | Tech Stack |
|-----------|------------|
| **Frontend** | Svelte 4, Vite 5, JavaScript (ESM), better-auth |
| **Backend** | Node.js, Express.js, PostgreSQL (Prisma ORM), OpenAI API |

**Deployments**: Frontend on Vercel, Backend on Railway

---

## 2. Build & Development Commands

### Frontend (`C:/Users/Saudp/projects/my-ai-assistant/`)
```bash
npm install          # Install dependencies
npm run dev          # Dev server on http://localhost:5173
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

### Backend (`C:/Users/Saudp/projects/ai-assistant-backend/`)
```bash
npm install          # Install dependencies
npm run dev          # Start server on http://localhost:3001
npm start            # Production start with migrations
npm run db:push      # Sync Prisma schema (no migrations)
npm run db:studio    # Open Prisma Studio GUI
```

### Testing & Linting
**Status**: No testing or linting configured.

**To add testing**:
- Frontend: `npm install -D vitest @testing-library/svelte`
- Backend: `npm install -D jest supertest`
- Run single test: `npx vitest run src/components/Button.test.js`

---

## 3. Code Style Guidelines

### General JavaScript
- **Modules**: ES Modules only (`"type": "module"` in package.json)
- **Variables**: Use `const`, avoid `var`, use `let` only when necessary
- **Async**: Always use `async/await`, never raw Promises
- **Imports ordering**:
  1. External libraries (e.g., `svelte`, `express`)
  2. Internal components (e.g., `./components/Header.svelte`)
  3. Stores/utils (e.g., `./stores/auth.js`)
  4. Styles (e.g., `./styles/global.css`)
- **File extensions**: ALWAYS include `.js` for local imports (e.g., `import { x } from './utils.js'`)

### Svelte Components
- **Naming**: PascalCase (e.g., `DocumentView.svelte`)
- **Structure**: `<script>` → Template → `<style>`
- **Props**: Use `export let propName = 'default'` with defaults
- **Reactivity**: Use `$:` for derived state sparingly
- **Event handlers**: Use `on:click={handler}` not `on:click={() => handler()}`
- **Scoped styles**: Default behavior, avoid `<style global>`

```svelte
<script>
  import { onMount } from 'svelte';
  import Button from './Button.svelte';
  
  export let title = 'Default Title';
  export let onAction = () => {};
</script>

<div class="card">
  <h2>{title}</h2>
  <Button on:click={onAction}>Action</Button>
</div>

<style>
  .card {
    background: var(--color-surface);
    padding: 1rem;
  }
</style>
```

### CSS & Theming
- **Theme**: Dark Navy Theme
- **Use CSS variables** from `src/styles/global.css`:
  - `--color-bg: #0a0e27` (background)
  - `--color-surface: #111840` (cards)
  - `--color-accent: #60a5fa` (primary actions)
  - `--color-text: #f1f5f9` (primary text)
- **Responsive**: Mobile-first, breakpoints at `640px` and `768px`

### Backend & API
- **Structure**: Express routes in `routes/` directory, imported in `server.js`
- **Error handling**: Wrap ALL async handlers in try/catch
- **Response format**: Always return JSON with consistent structure
- **Database**: Use Prisma client, never raw SQL

```javascript
// Route handler pattern
app.post('/api/resource', async (req, res) => {
  try {
    const result = await prisma.resource.create({ data: req.body });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Resource creation error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Naming Conventions
- **Variables/functions**: camelCase (e.g., `documentId`, `fetchData`)
- **Components**: PascalCase (e.g., `UserProfile.svelte`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Files**: Match component name exactly
- **Database models**: PascalCase (e.g., `Document`, `User`)

---

## 4. Agent Operational Rules

1. **Security**: Never commit secrets (.env, API keys). Use environment variables.
2. **Paths**: Always use absolute paths:
   - Frontend: `C:/Users/Saudp/projects/my-ai-assistant/`
   - Backend: `C:/Users/Saudp/projects/ai-assistant-backend/`
3. **Verification**: After changes, run `npm run build` to check for errors.
4. **No hallucinations**: Don't reference non-existent files or scripts.
5. **Admin features**: Admin UI in `src/components/admin/`, endpoints at `/api/admin/*`
6. **Auth**: All admin routes require `credentials: "include"` in fetch calls.

---

## 5. Environment Configuration

**Backend `.env`**:
```ini
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"
OPENAI_API_KEY="sk-..."
PORT=3001
```

**Frontend**: Uses `VITE_API_BASE_URL` (set to Railway URL in production)
