# Developer Guide

## Project Goals

This project converts ICS calendar data into Tbricks-compatible XML.

Current design priorities:

- Minimal dependency footprint
- Secure-by-default dependency policy
- Modern TypeScript and Node runtime
- Simple CLI-first execution model

## Stack

- Runtime: Node.js 20+
- Language: TypeScript 5
- Module system: ESM (`type: module`, `NodeNext`)
- ICS parser: internal lightweight parser in `src/core.ts`
- XML conversion: `xml-js`

## Repository Layout

- `src/core.ts`: runtime-agnostic conversion logic (Node + browser)
- `src/ics2tbricks.ts`: Node CLI entrypoint and Node-facing exports
- `src/browser.ts`: browser-facing helpers for user-provided ICS text/files
- `extra_src/`: sample input/output assets
- `dist/`: build output (generated)
- `.github/workflows/ci.yml`: CI pipeline

## Scripts

- `npm run clean`: remove `dist`
- `npm run build`: compile TypeScript to `dist`
- `npm run start`: run compiled CLI
- `npm run typecheck`: run TypeScript checks without emit

## Local Workflow

1. Install dependencies:
   ```bash
   npm install
   ```
2. Type-check:
   ```bash
   npm run typecheck
   ```
3. Build:
   ```bash
   npm run build
   ```
4. Run:
   ```bash
   npm start -- "https://example.com/calendar.ics" "HK"
   ```

## Architecture Notes

The converter pipeline in `src/core.ts` is:

1. Fetch ICS text (`calResourceFromURL`)
2. Parse VEVENT items (internal parser)
3. Filter relevant closures (`description === "Hong Kong Market is closed"`)
4. Group closures by year
5. Produce `xml-js` JSON shape
6. Serialize to XML (`json2xml`)

The core pure function is `calResourceFromIcs(icsData, countryCode)`, which is preferred for unit testing and reuse.

Browser integration should use user-supplied ICS content and call:

- `calResourceFromIcs(icsText, countryCode?)`
- `calResourceFromIcsFile(file, countryCode?)`

## Dependency Policy

When updating dependencies:

- Prefer fewer packages over convenience wrappers.
- Prefer built-in Node APIs (`fetch`, URL handling, etc.) where practical.
- Run `npm audit` and keep high/critical vulnerabilities at zero.
- Avoid adding build tools unless there is a concrete need.

## Backward Compatibility

The current output is intended to preserve existing conversion semantics:

- Same default calendar URL
- Same default country code (`HK`)
- Same XML resource structure

## Safe Change Checklist

Before merging:

- `npm run typecheck` passes
- `npm run build` passes
- `npm audit` reports no high/critical vulnerabilities
- README usage still matches CLI behavior
