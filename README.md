# ICS to Tbricks Calendar Resource

Convert an ICS market calendar into a Tbricks calendar resource XML document.

## Who this is for

- End-users who want to convert an ICS URL into Tbricks XML output.
- Developers who want to maintain or extend the converter.
- Coding agents that need repo-specific operating guidance.

## Quick Start (End-Users)

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Build

```bash
npm run build
```

### Run

Use defaults (HKEX URL + country code `HK`):

```bash
npm start
```

Use custom values:

```bash
npm start -- "https://example.com/calendar.ics" "SE"
```

The XML is printed to stdout. Redirect to a file if needed:

```bash
npm start -- "https://example.com/calendar.ics" "SE" > calendar.xml
```

## CLI Behavior

- Argument 1: calendar URL (must start with `http://` or `https://`)
- Argument 2: country code used in `<resource name="...">`
- Failure exits with non-zero code and prints an error message.

## Developer Documentation

See [docs/DEVELOPERS.md](docs/DEVELOPERS.md) for project layout, architecture, and workflows.

## Coding Agent Documentation

See [AGENTS.md](AGENTS.md) for agent-specific rules and expectations.

## Validation & CI

The CI workflow runs:

- `npm ci`
- `npm audit --audit-level=high`
- `npm run build`

Workflow file: [.github/workflows/ci.yml](.github/workflows/ci.yml)
