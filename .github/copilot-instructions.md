# FMP Stadium Planner - AI Instructions

**Note: This file must be edited and maintained exclusively by the AI assistant. Manual edits are discouraged to ensure consistency and up-to-date automation. All additions and changes must be written in English. Every time the AI assistant learns something new about the project, this knowledge must be added to this file.**

## Project Overview
FMP Stadium Planner is a Tampermonkey userscript that helps planning stadium upgrades on the Football Manager Project (FMP) browser game. It shows the maximum income for your stadium in league games, based on seat types (standing, standard, covered, VIP) and their respective multipliers. All calculations use the ⓕ currency symbol (not $).

## Architecture
- **Source**: Modular TypeScript in `src/` (entry: `src/index.ts`, logic: `src/stadium.ts`, planner: `src/planner.ts`, i18n: `src/i18n.ts`, API: `src/stadium-api.ts`)
- **Bundler**: Rollup (see `rollup.config.mjs`). Output banner is injected from `userscript-metatags.js` at build time.
- **Metadata header**: `userscript-metatags.js` (imported as a banner in Rollup)
- **Output**: Single bundle ready for Tampermonkey in `dist/` (e.g., `dist/fmp-stadium-planner.user.js`)
- **Core class**: `Stadium` - manages seat counts and multipliers. Uses `SeatsLayout` DTO for input.
- **Entry point**: IIFE for userscript isolation (`src/index.ts` builds the UI and invokes planner logic when needed)

## Development Workflow

### Build & Test
- Develop in TypeScript (`src/`)
- Build: `npm run bundle` (Rollup produces the bundle in `dist/` with header from `userscript-metatags.js`)
- Test: `npm test` (runs Jest unit tests)
- Debug: Chrome debugger (see `.vscode/launch.json`, not versioned, points to production FMP Stadium page)

### Tampermonkey Testing
1. Copy the bundle from `dist/` as a new script into Tampermonkey
2. Navigate to the matched URL (`@match` in the metatag)
3. Check the output in the browser console

## Tampermonkey Metadata
- Header in `userscript-metatags.js` (imported by Rollup as a banner)
- Update `@version` (semantic version format Major.Minor.Patch, e.g. 0.1.0) before each release. The minor version increases for each WIP feature completed, until reaching 1.0.0.
- `@match` should target `https://footballmanagerproject.com/Economy/Stadium` (production)

## Key Patterns & Conventions

### Stadium Multipliers (Fixed Constants)
Defined as static class properties in `Stadium`:
- Standing: 1x base ticket price
- Standard: 2x base ticket price
- Covered: 4x base ticket price
- VIP: 12x base ticket price

**Example usage:**
```ts
// Create a stadium using the SeatsLayout DTO
const stadium = new Stadium({ standing: 11040, standard: 5520, covered: 2760, vip: 690 });
stadium.calcMaxIncome(28); // Calculates with 28 ⓕ base ticket
```

### DTO for Seat Layout
Use the `SeatsLayout` interface as a Data Transfer Object (DTO) to represent the seat configuration across the codebase. Use `SeatsLayout` for:
- Constructing `Stadium` instances
- Returning or passing layouts from `Stadium.getLayout()`
- Representing computed ideals and incremental additions in `planner` and helpers

Guidelines:
- Prefer passing `SeatsLayout` objects instead of multiple primitive parameters for clarity and future extensibility.
- Values in `SeatsLayout` are integers for actual seat counts. When computing ideals (fractions), use `SeatsLayout` with numeric (possibly fractional) values only internally; round/ceil before applying to seat counts.

**Example usage:**
```ts
const layout: SeatsLayout = { standing: 100, standard: 200, covered: 50, vip: 10 };
const stadium = new Stadium(layout);

// Ideal and add-layouts used by planner (internal computation may use fractional idealLayout)
const idealLayout = { standing: 1600, standard: 800, covered: 400, vip: 100 } as SeatsLayout;
const addLayout = { standing: 10, standard: 5, covered: 2, vip: 1 } as SeatsLayout;
```

### Proportional Seat Allocation (Planner Algorithm)
The `planner` function computes a new stadium seat distribution to reach a desired total, using the fixed ratio VIP:Covered:Standard:Standing = 1:4:8:16. Implementation notes:

- Total weight = 1 + 4 + 8 + 16 = 29.
- The planner computes an `idealLayout` from `desiredTotal` using fractional math, then computes the integer `addLayout` using `Math.ceil(ideal - current)` per type. This ensures no type is decreased.
- If the sum of required additions to reach each ideal exceeds available remaining seats, the planner uses a greedy allocator (`distributeGreedy`) that incrementally assigns seats to the types with the largest gap to their ideal until seats are exhausted.
- Otherwise the planner first applies the minimum additions to reach ideals, then distributes leftover seats in the weight order VIP -> Covered -> Standard -> Standing repeatedly (`distributeWithExtra`).

Example (current behavior):
```ts
const current = new Stadium({ standing: 100, standard: 100, covered: 100, vip: 100 });
const planned = planner(2900, current);
// planned layout follows the 1:4:8:16 ratio approximated to integers
```

### Constructor Pattern
The Stadium constructor takes 4 positional arguments: `standing, standard, covered, vip`. No validation or default values—assumes valid positive integers.

## Best Practices & Publishing
- Keep the IIFE wrapper for userscript isolation.
- Use static class properties for multipliers (ES2022) as in `Stadium`.
- Use `console.log()` for debug output during development; remove or gate verbose logs for releases.
- Always update `@version` in `userscript-metatags.js` before releases.
- Commit the `dist/` bundle used for distribution to the release artifacts.
- Always use the ⓕ currency symbol (not $) in all outputs and documentation.

## Code Style Guidelines
- All code comments, variable names, and function names must always be written in English.

### Publishing (Greasyfork + GitHub)
- Upload the bundle from `dist/` to a GitHub Release.
- Include the `@updateURL` and `@downloadURL` metatags pointing to the raw file on GitHub (see example below).
- On Greasyfork, use the raw GitHub URL as the source for automatic updates.
- Always update the `@version` field in `userscript-metatags.js` using semantic versioning (Major.Minor.Patch).

**Example metatag for combined distribution:**
```js
// @updateURL   https://github.com/napcoder/fmp-stadium-planner/releases/latest/download/fmp-stadium-planner.user.js
// @downloadURL https://github.com/napcoder/fmp-stadium-planner/releases/latest/download/fmp-stadium-planner.user.js
```

### README & Badge
- Add a Greasyfork install badge and direct link to the GitHub Release.
- Document the pipeline and the automatic update mechanism.

## Change Log (AI edits)
- 2025-12-23: AI refactored `planner` to use `SeatsLayout` DTO for ideals and additions; updated `distributeWithExtra` signature to accept `SeatsLayout` add object.
- 2025-12-23: Reorganized and cleaned this guidelines file for clarity and removed duplicate sections.

---

### Debugging Note
The `.vscode/launch.json` file is not versioned. The current configuration launches Chrome against the production FMP Stadium page:

```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch Chrome against FMP",
  "url": "https://footballmanagerproject.com/Economy/Stadium",
  "webRoot": "${workspaceFolder}"
}
```

---

### Version Control Note
This file (`.github/copilot-instructions.md`) **must be versioned**:
- It serves as technical documentation and onboarding for AI and developers
- It makes the pipeline and project conventions transparent
- It is useful for future automation and maintenance
- All changes and additions must be written in English.
- Every time the AI assistant learns something new about the project, this knowledge must be added to this file.
- The project uses semantic versioning (Major.Minor.Patch) for releases.
