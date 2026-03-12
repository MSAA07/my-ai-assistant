# Project Structure (Frontend)

This file describes the current structure of `my-ai-assistant`.

## Root Tree

```text
my-ai-assistant/
|-- AGENTS.md
|-- agent.md
|-- README.md
|-- SYSTEM_OVERVIEW.md
|-- PROJECT_STRUCTURE.md
|-- package.json
|-- package-lock.json
|-- vite.config.js
|-- svelte.config.js
|-- index.html
`-- src/
```

## `src/` Tree

```text
src/
|-- App.svelte
|-- main.js
|-- config.js
|-- routes.js
|-- components/
|   |-- AdminDashboard.svelte
|   |-- AppHeader.svelte
|   |-- Footer.svelte
|   |-- admin/
|   |   |-- AdminStats.svelte
|   |   |-- AuditLogViewer.svelte
|   |   |-- SessionManager.svelte
|   |   |-- StorageOverview.svelte
|   |   |-- UserDetail.svelte
|   |   `-- UserTable.svelte
|   `-- auth/
|       |-- SignIn.svelte
|       `-- SignUp.svelte
|-- lib/
|   |-- components/
|   |   |-- layout/
|   |   |   |-- AppShell.svelte
|   |   |   |-- BottomNav.svelte
|   |   |   |-- Sidebar.svelte
|   |   |   `-- TopBar.svelte
|   |   `-- ui/
|   |       |-- ConfirmModal.svelte
|   |       |-- DrawerShell.svelte
|   |       |-- EmptyState.svelte
|   |       |-- LanguageToggle.svelte
|   |       |-- ThemeToggle.svelte
|   |       `-- StatusBadge.svelte
|   |-- config/features.js
|   |-- i18n/
|   |   |-- ar.js
|   |   |-- en.js
|   |   `-- t.js
|   |-- stores/language.js
|   `-- styles/tokens.css
|-- pages/
|   |-- Home.svelte
|   |-- Documents.svelte
|   |-- DocumentView.svelte
|   |-- Settings.svelte
|   |-- Exams.svelte
|   |-- Flashcards.svelte
|   `-- Landing.svelte
|-- stores/
|   |-- auth.js
|   |-- theme.js
|   `-- router.js
`-- styles/global.css
```

## Directory responsibilities

- `pages/`: route-level screens
- `components/`: feature-focused components (admin/auth)
- `lib/components/`: reusable shell/UI primitives
- `stores/`: global app state (auth + router)
- `lib/i18n/`: dictionaries + translation helper
- `lib/config/features.js`: feature toggles
- `styles/` + `lib/styles/`: global and tokenized styling

## Notes

- Routing is hash-based and defined in `src/routes.js`.
- API base resolution is in `src/config.js`.
- Session bootstrapping and auth requests are in `src/stores/auth.js`.
- Theme bootstrapping and persistence are in `src/stores/theme.js`.

Last Updated: March 12, 2026
