# Project architecture

This is a Next.js App Router application with a browser-based document workspace, optional Supabase persistence, and server-side AI and Stripe integrations.

```text
src/
  app/                         Next.js routes, metadata, styles, and error pages
    page.tsx                   Server entry point rendering Workspace
    api/**/route.ts            HTTP method exports; existing URLs stay stable
  components/
    layout/                    Sidebar and TopHeader
    ui/                        Toast, ErrorAlert, and ErrorBoundary
  features/
    applications/components/  Application tracking
    billing/components/       Authentication and pricing UI
    cover-letter/components/  Generator, editor, and cold email UI
    cv/components/            Executive CV editor
    job-match/components/     ATS analysis and job import UI
    profiles/components/      Saved resume profile management
    resume/
      components/             Editor, print preview, and template selector
      data/                   Sample resume presets
    settings/components/      API key and theme settings
    workspace/
      components/             Workspace orchestration and feedback UI
      types.ts                Workspace navigation contract
  lib/                         Shared storage, browser integrations, and utilities
  server/handlers/             Server-only HTTP implementations grouped by endpoint
  types/                       Editor and generation data contracts
tests/                         Node test runner regression tests
docs/                          Architecture guide and screenshots
presentation/                  Project presentation artifacts
```

## Dependency rules

- `app` composes entry points. The client `Workspace` owns tool selection, modal state, and visited-tool retention. Keep interactive behavior behind its client boundary.
- Feature components may consume shared UI, shared libraries, and other feature components where composition requires it. Shared UI must not depend on feature workflows.
- The resume editor owns editing state; `ResumePreview.tsx` owns print rendering; sample data lives separately from both.
- API route files export handlers from `server/handlers`. These implementations still use Next.js request/response types; they are HTTP handlers, not framework-independent domain services. Extract reusable services when multiple handlers need the same behavior.
- Every server handler imports `server-only`, so Next.js rejects accidental imports into client components. Credentials and Node networking code belong here. Client components call HTTP endpoints instead.
- Use `@/` imports across folder boundaries. Relative imports within a feature are fine. Libraries imported directly by Node tests retain explicit `.ts` imports where necessary.
- Do not import route modules from features or libraries. Keep route configuration exports, if added, directly in `route.ts` so Next.js can analyze them.

## Data and persistence

`lib/storage.ts` is the persistence boundary for local documents and optional cloud synchronization. Its persisted records use `company` and title-case statuses; the editor contracts in `types/index.ts` use `targetCompany` and lowercase statuses. These are currently distinct representations, with conversion in the workspace/editor. Do not merge them by renaming fields without a migration for existing local and cloud records.

`lib/supabase.ts`, `lib/theme.ts`, and `lib/usage.ts` support browser workflows. Usage flags and balances in browser storage are UI state, not authoritative payment or authorization records.

## Remaining design work

This structural refactor preserves application behavior and existing persistence formats. It does not resolve the payment fulfillment, server-side quota enforcement, and request-validation issues recorded in the earlier [project audit](../PROJECT_AUDIT.md). That audit's file paths refer to the pre-refactor layout. The resume and CV editors also remain substantial components; further decomposition should follow individual editing sections and their state requirements.

## Validation

Run `npm run lint`, `npm test`, `node node_modules/typescript/bin/tsc --noEmit`, and `npm run build`. A Webpack build (`npm run build -- --webpack`) can validate production compilation when the environment cannot support Turbopack's local port requirements. External AI, billing, and cloud integration behavior requires configured services and separate integration checks.
