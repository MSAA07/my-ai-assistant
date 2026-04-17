# Study Maxing Frontend

Current frontend for the Study Maxing public entry, auth experience, and authenticated study workflow.

## Documentation Model

- Shared docs remain the correct source-of-truth model.
- This repo implements one frontend runtime, with environment-specific behavior limited mainly to deployment host and backend resolution.
- Stage and production differences are documented inline only where they are verified and operationally useful.

## What This Repo Owns

- Svelte frontend runtime
- hash-based routing across public, auth, and authenticated surfaces
- refreshed public marketing and auth shell
- canonical authenticated study flow under `#/study`
- Better Auth browser-session integration
- backend API consumption for upload, study, admin, settings, and auth utility flows

## Quick Orientation

- public landing route: `#/`
- public auth routes: `#/sign-in`, `#/sign-up`
- additional public auth utility routes: `#/forgot-password`, `#/reset-password`, `#/verify-email`
- `App.svelte` owns the public shell split versus the authenticated shell
- `src/components/public/PublicHeader.svelte` owns public navigation, Study Maxing branding, section navigation, and the shared theme toggle
- `src/components/public/PublicFooter.svelte` owns the shared footer used by landing and public auth pages
- `src/pages/Landing.svelte` is the Study Maxing marketing surface
- authenticated navigation still hands off to `AppShell`
- canonical study routes live under `#/study`

## Public and Auth Runtime

- Landing, sign-in, sign-up, forgot-password, reset-password, and verify-email all render inside the shared public shell.
- Landing section navigation uses router-safe hash query links like `#/?section=features` and `#/?section=faq`.
- Primary CTA routing uses `#/sign-in` and `#/sign-up`.
- The theme toggle is available on landing and on the public auth surfaces through `PublicHeader.svelte`.
- The authenticated application remains a separate shell and does not reuse the public shell layout.

## Environment Notes

Shared behavior:

- `VITE_API_BASE_URL` overrides all host-derived backend resolution.
- Auth verification and password reset callbacks default to the current frontend origin and can be overridden with:
  - `VITE_AUTH_VERIFICATION_CALLBACK_URL`
  - `VITE_AUTH_PASSWORD_RESET_CALLBACK_URL`

Stage:

- Vercel preview and stage-style frontend hosts resolve to the staging backend by default.

Production:

- `studymaxing.com`, `www.studymaxing.com`, `my-ai-assistant.vercel.app`, and production-like hosts resolve to the production backend by default.

Environment differences:

- The frontend runtime is shared; the verified long-term difference is backend selection based on host or explicit env override.
- Support email and Turnstile behavior are environment-configurable through env vars, but this repo does not prove distinct stage-vs-production values by itself.

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Related Docs

- `SYSTEM_OVERVIEW.md`: runtime, route, auth, and lifecycle source of truth
- `PROJECT_STRUCTURE.md`: file and folder ownership
- `UI_POST_ROLLOUT.md`: current UI guarantees and deferred items
- `src/lib/components/ui/PRIMITIVES.md`: primitive usage guidance
- `src/lib/components/ui/DATA_SURFACE_PATTERN.md`: dense admin/data-surface guidance
- `docs/*`: archival rollout references, not current runtime source of truth

Last Updated: April 17, 2026
