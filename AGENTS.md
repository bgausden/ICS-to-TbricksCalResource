# Agent Guide

This file provides repository-specific guidance for coding agents.

## Mission

Maintain a minimal, secure, and understandable ICS-to-Tbricks converter.

## Core Rules

1. Keep dependency count low.
2. Prefer Node built-ins over third-party packages.
3. Preserve CLI behavior unless explicitly asked to change it.
4. Keep output XML structure stable unless user requests a format change.
5. Avoid broad refactors outside requested scope.

## Expected Commands

Run these after meaningful code changes:

```bash
npm run typecheck
npm run build
npm audit
```

## Entry Points

- Core source: `src/core.ts`
- Node source: `src/ics2tbricks.ts`
- Browser source: `src/browser.ts`
- Build output: `dist/ics2tbricks.js`

## Public API Surface

Treat these exports as intentional API:

- `DEFAULT_COUNTRY_CODE`
- `DEFAULT_CALENDAR_URL`
- `calResourceFromIcs(icsData, countryCode?)`
- `calResourceFromURL(url?, countryCode?)`
- `calResourceFromIcsFile(file, countryCode?)`

If renaming/removing, update docs and provide migration notes.

## Change Guardrails

- Do not add heavy toolchains (bundlers, frameworks) without explicit request.
- Do not introduce network behavior beyond fetching the ICS URL.
- Do not commit generated output from `dist/` unless explicitly requested.
- Do not weaken TypeScript strictness without explicit approval.

## Documentation Expectations

When behavior or scripts change, update:

- `README.md` for end-users
- `docs/DEVELOPERS.md` for maintainers
- `AGENTS.md` for future coding agents

## CI Expectations

The CI workflow at `.github/workflows/ci.yml` should remain green and include:

- install
- security audit
- build

Prefer small, reviewable commits.
