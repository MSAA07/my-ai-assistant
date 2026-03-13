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
|-- tailwind.config.js
|-- postcss.config.cjs
|-- vite.config.js
|-- svelte.config.js
|-- index.html
|-- docs/
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
|   |       |-- Badge.svelte
|   |       |-- Button.svelte
|   |       |-- Card.svelte
|   |       |-- ConfirmModal.svelte
|   |       |-- DataSurface.svelte
|   |       |-- DrawerShell.svelte
|   |       |-- EmptyState.svelte
|   |       |-- FieldShell.svelte
|   |       |-- LanguageToggle.svelte
|   |       |-- MetaPill.svelte
|   |       |-- ModalSurface.svelte
|   |       |-- Section.svelte
|   |       |-- StatCard.svelte
|   |       |-- Tabs.svelte
|   |       |-- ThemeToggle.svelte
|   |       |-- Toggle.svelte
|   |       |-- UploadDropzone.svelte
|   |       |-- UploadFileRow.svelte
|   |       |-- UploadPanel.svelte
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
|   |-- Exams.svelte
|   |-- Flashcards.svelte
|   |-- Settings.svelte
|   |-- StudyHubDocument.svelte
|   |-- StudyHubIndex.svelte
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
- The authenticated app now uses a shared dashboard shell (`AppShell + Sidebar + TopBar + BottomNav`).
- `StudyHubIndex.svelte` is the canonical library route for `/study`.
- `StudyHubDocument.svelte` owns the document hub surface for `/study/:id/:section?`.
- `DocumentView.svelte` consolidates summary, flashcards, and exam study states for legacy activity routes.
- API base resolution is in `src/config.js`.
- Session bootstrapping and auth requests are in `src/stores/auth.js`.
- Theme bootstrapping and persistence are in `src/stores/theme.js`.
- Tailwind utilities are available, but visual source of truth remains `src/lib/styles/tokens.css` plus shared UI primitives.

Last Updated: March 13, 2026
