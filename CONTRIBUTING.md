# Contributing to AI Cover Letter & Resume Builder

Thanks for taking the time to contribute! Here's how to get started.

## Getting Started

1. Fork the repository and clone your fork locally.
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env.local` and fill in the values.
5. Run the dev server: `npm run dev`

## Development Workflow

- Run the linter: `npm run lint`
- Run the tests: `npm test`
- Build to verify production bundling: `npm run build`

Make sure all three pass before opening a pull request.

## Commit Messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) style:

- `feat: add new feature`
- `fix: fix a bug`
- `docs: update documentation`
- `refactor: refactor code`
- `test: add or update tests`
- `chore: maintenance tasks`

## Pull Request Guidelines

- Keep changes focused and small; one PR per logical change.
- Add tests for new logic where practical.
- Do not commit `.env.local` or any secrets.
- Update the README if user-facing behavior changes.

## Code Style

- TypeScript strict mode, no `any` unless absolutely necessary.
- Prefer server-side API routes for anything using API keys — never expose keys to the client.
- Components go in `src/components/`, libs in `src/lib/`, routes in `src/app/api/`.

## Reporting Issues

Found a bug or want a feature? Open an issue using the provided templates (bug report / feature request).
