# Repository Guidelines

## Project Structure & Module Organization

Dream Diary uses Next.js App Router, React, TypeScript, and MobX.

- `app/`: pages, layouts, route-local components, and `api/` handlers; `(public)` and `(private)` organize routes.
- `lib/entities/`: domain types, repositories, and stores. `lib/features/`: application workflows and server actions. `lib/shared/`: reusable auth, HTTP, hooks, and utilities. `lib/providers/`: React providers.
- `_components/`: shared components; `_components/ui/` contains UI primitives. Keep CSS Modules beside components.
- `infrastructure/`: PostgreSQL access, SQL migrations, and S3 integration.
- `__tests__/`: automated tests. `public/`: static images, logos, and other assets.

## Build, Test, and Development Commands

Use Yarn 4.12.0, as pinned in `package.json`.

- `yarn install`: install dependencies.
- `docker compose -f docker-compose.dev.yaml up -d`: start PostgreSQL and MinIO, apply migrations, and initialize storage.
- `yarn dev`: run Next.js locally at `http://localhost:3000`.
- `yarn build` / `yarn start`: build and serve the production application.
- `yarn lint`: run ESLint with Next.js Core Web Vitals and TypeScript rules.
- `yarn test --runInBand`: run Jest and generate coverage.
- `yarn db:dev:new <name>` / `yarn db:dev:migrate`: create or apply development migrations.

## Coding Style & Naming Conventions

Use strict TypeScript, `@/` imports for repository-root paths. Name components and store classes in PascalCase, functions and variables in camelCase, and hooks `useSomething`. Follow Next.js conventions such as `page.tsx` and `route.ts`. Use `ComponentName.module.css` for component styles.

## Testing Guidelines

Use Jest with `next/jest` and React Testing Library. Name tests `__tests__/<subject>.test.ts` or `.test.tsx`. The default environment is jsdom; server tests use `/** @jest-environment node */`. Mock database and external service boundaries, and cover success, failure, and authentication behavior. Run a focused test with `yarn test --runInBand __tests__/profileForm.test.tsx`. Coverage is collected in `coverage/`; no minimum threshold is configured.

## Commit & Pull Request Guidelines

History contains only `initial` and `README fixed`; no formal commit convention is established. Use concise, descriptive commit subjects. PRs should explain the change, link relevant issues, list validation performed, and include screenshots for UI changes. Describe configuration or migration requirements.

## Configuration & Database Changes

Create `.env` from `.env.example` if absent; keep credentials out of commits. SQL migrations belong in `infrastructure/db/migrations/` with timestamped filenames and `-- migrate:up` / `-- migrate:down` sections. Verify application and rollback on a local database.

## Language

Use Russian language for comments, error messages, documentation and AI responses.
