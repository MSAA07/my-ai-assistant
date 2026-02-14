# AI Study Assistant - Agent Guidelines

## Project Overview

AI Study Assistant - A Svelte + Express.js application for uploading study materials and getting AI-powered summaries, flashcards, and practice exams.

**Stack**: Svelte 4 + Vite + Express.js + PostgreSQL (Prisma) + OpenAI GPT-4o-mini

---

## Build Commands

```bash
# Development
npm run dev              # Start Vite dev server (port 5173)
npm run dev:server       # Start Express backend (port 3001)
npm run dev:all          # Run both frontend and backend

# Production
npm run build            # Build production bundle
npm run preview          # Preview production build

# Database
npm run db:push          # Push Prisma schema to database
npm run db:studio        # Open Prisma Studio GUI
```

**Note**: No linting or testing tools are currently configured.

---

## Code Style Guidelines

### JavaScript/ES Modules

- Use ES modules (`import`/`export`) - project has `"type": "module"`
- Prefer `const` and `let` over `var`
- Use async/await for asynchronous code
- Always include `.js` extension in relative imports

### Import Order

1. External dependencies (npm packages)
2. Internal Svelte components
3. Stores and utilities
4. Styles (CSS imports last)

```javascript
import { onMount } from "svelte";
import AppHeader from './components/AppHeader.svelte';
import { currentPath } from './stores/router.js';
import './styles/global.css';
```

### Naming Conventions

- **Components**: PascalCase (`AppHeader.svelte`, `DocumentView.svelte`)
- **Stores**: camelCase (`router.js`, `currentPath`)
- **Variables/Functions**: camelCase
- **CSS Classes**: kebab-case (`--color-bg`, `file-label`)
- **Files**: Match component name exactly

### File Organization

```
src/
├── components/     # Reusable UI components (PascalCase)
├── pages/          # Route-level components (PascalCase)
├── stores/         # Svelte stores (camelCase)
└── styles/         # Global styles
```

### Svelte Components

- Use `<script>` at top, then template, then `<style>`
- Use reactive statements (`$:`) sparingly
- Prefer props over global state when possible
- Style blocks should be scoped (no `global` attribute needed)

```svelte
<script>
  import Component from './Component.svelte';
  export let propName;
  $: computedValue = propName + 1;
</script>

<div class="component-wrapper">
  <Component value={computedValue} />
</div>

<style>
  .component-wrapper {
    /* scoped styles */
  }
</style>
```

### CSS Conventions

Use the established CSS variables from `src/styles/global.css`:

```css
/* Colors */
var(--color-bg)              /* #0a0e27 - Main background */
var(--color-surface)         /* #111840 - Card backgrounds */
var(--color-border)          /* #1e2758 - Borders */
var(--color-accent)          /* #60a5fa - Primary accent */
var(--color-text)            /* #f1f5f9 - Primary text */
var(--color-text-secondary)  /* #cbd5e1 - Secondary text */

/* Gradients */
var(--gradient-accent)       /* linear-gradient(135deg, #60a5fa, #93c5fd) */
```

### Error Handling

- Always wrap API calls in try/catch
- Use descriptive error messages
- Clear errors before new operations

```javascript
try {
  const response = await fetch(url);
  const data = await response.json();
} catch (err) {
  console.error('Operation failed:', err);
  error = 'User-friendly error message';
}
```

### API Patterns

Base URL: `http://localhost:3001`

```javascript
// GET request
const response = await fetch(`http://localhost:3001/api/user/${userId}`);
const data = await response.json();

// POST with FormData
const formData = new FormData();
formData.append('file', file);
formData.append('key', value);

const response = await fetch('http://localhost:3001/api/upload', {
  method: 'POST',
  body: formData
});
```

### Routing

Uses custom hash-based router (`src/stores/router.js`):

```javascript
import { router } from './stores/router.js';

// Navigate
router.navigate('/path');

// Current route (reactive)
import { currentPath } from './stores/router.js';
$: route = $currentPath;
```

Routes:
- `/` - Landing page
- `/app` - Main app (Home)
- `/document/:id` - Document view

---

## Best Practices

1. **Keep components focused** - One responsibility per component
2. **Use semantic HTML** - Proper headings, labels, ARIA attributes
3. **Responsive design** - Mobile-first with breakpoints at 768px and 640px
4. **Dark theme** - All UI should use the dark navy color scheme
5. **File uploads** - Max 25MB, supported types: PDF, DOCX, PPTX
6. **Always handle loading states** - Show feedback during async operations
7. **Clean up** - Clear intervals/timeouts in `onDestroy`

---

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `PORT` - Server port (default: 3001)

---

## Quick Reference

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **No TypeScript** - Pure JavaScript only
- **No testing framework** - Add tests if needed
- **Prisma ORM** - Database operations via `@prisma/client`
