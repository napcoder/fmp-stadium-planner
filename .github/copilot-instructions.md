# FMP Stadium Planner - AI Instructions

**Note: This file must be edited and maintained exclusively by the AI assistant. Manual edits are discouraged to ensure consistency and up-to-date automation. All additions and changes must be written in English. Every time the AI assistant learns something new about the project, this knowledge must be added to this file.**

## Project Overview
FMP Stadium Planner is a Tampermonkey userscript that helps planning stadium upgrades on the Football Manager Project (FMP) browser game. It shows the maximum income for your stadium in league games, based on seat types (standing, standard, covered, VIP) and their respective multipliers. All calculations use the ⓕ currency symbol (not $).

## Architecture
- **Source**: Modular TypeScript in `src/` (entry: `src/index.ts`, logic: `src/stadium.ts`, planner: `src/planner.ts`, i18n: `src/i18n.ts`, API: `src/stadium-api.ts`)
- **Bundler**: Rollup (see `rollup.config.mjs`). Output banner is injected from `userscript-metatags.js` at build time.
- **Metadata header**: `userscript-metatags.js` (imported as a banner in Rollup)
- **Output**: Single bundle ready for Tampermonkey in `dist/` (e.g., `dist/fmp-stadium-planner.user.js`)
- **Core classes**:
  - `Stadium`: manages seat counts and multipliers. Uses `SeatsLayout` DTO for input.
  - `EnhancedStadium`: extends `Stadium` by adding a `baseTicketPrice` property and related helpers (e.g. `.clone()`, `.fromStadium()`, `.calcMaxIncome()` without arguments). Used for stateful operations and UI.
  - `Store`: simple observable state container (see `src/store.ts`). Holds `currentStadium` and `plannedStadium` (both `EnhancedStadium`), notifies listeners on relevant changes. Used for UI reactivity.

- **UI Views**: All UI is rendered via functions in `src/view/`:
  - `planner-view.ts`: Main planner interface, renders seat table, input for total seats, and plan button. Subscribes to `Store` for reactivity.
  - `info-view.ts`: Renders stadium info and income summary.
  - `title.ts`: Utility for rendering section titles.
  - All views are pure functions that take a container and a `Store` instance, and update the DOM accordingly.
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
- The `Stadium` constructor takes a `SeatsLayout` object. No validation or default values—assumes valid positive integers.
- The `EnhancedStadium` constructor takes a `SeatsLayout` and a `baseTicketPrice` (number). Use `.fromStadium()` to create from a `Stadium` and price.

## Best Practices & Publishing
- Keep the IIFE wrapper for userscript isolation.
- Use static class properties for multipliers (ES2022) as in `Stadium`.
- Use `console.log()` for debug output during development; remove or gate verbose logs for releases.
- Always update `@version` in `userscript-metatags.js` before releases.
- Commit the `dist/` bundle used for distribution to the release artifacts.
- Always use the ⓕ currency symbol (not $) in all outputs and documentation.

## Code Style Guidelines
- All code comments, variable names, and function names must always be written in English.
- UI labels for user-facing fields should be in Italian (e.g. "posti totali" for the seat input in planner-view), unless otherwise specified by the product owner.

### Publishing (Greasyfork + GitHub)
- Upload the bundle from `dist/` to a GitHub Release.
- Include the `@updateURL` and `@downloadURL` metatags pointing to the raw file on GitHub (see example below).
- On Greasyfork, use the raw GitHub URL as the source for automatic updates.
- Always update the `@version` field in `userscript-metatags.js` using semantic versioning (Major.Minor.Patch).

**Example metatag for combined distribution:**
```js
// @updateURL   https://github.com/napcoder/fmp-stadium-planner/releases/latest/download/fmp-stadium-planner.js
// @downloadURL https://github.com/napcoder/fmp-stadium-planner/releases/latest/download/fmp-stadium-planner.js
```

### README & Badge
- Add a Greasyfork install badge and direct link to the GitHub Release.
- Document the pipeline and the automatic update mechanism.

## Change Log (AI edits)
- 2025-12-24: Added documentation for Store, EnhancedStadium, and the view modules (planner-view, info-view, title). Noted the Italian label for seat input in planner-view.
- 2025-12-23: AI refactored `planner` to use `SeatsLayout` DTO for ideals and additions; updated `distributeWithExtra` signature to accept `SeatsLayout` add object.
- 2025-12-23: Reorganized and cleaned this guidelines file for clarity and removed duplicate sections.

## Third-party UI libraries evaluation

The target site already exposes a set of common frontend libraries. Because those libraries are loaded by the host page at runtime, our decision is only whether to *use* the page-provided globals — not whether to include them in the bundle.

Short notes for each library (presence on-site assumed):
- `jquery 3.7.1`: Useful for concise DOM selection and event handling. If the host page provides `window.jQuery` and you prefer jQuery-style code, it is safe to use the global rather than bundling your own copy.
- `jquery-ui 1.13.2`: Useful for complex widgets (dialogs, sliders, draggables). Use it only if you need those widgets and the site exposes it.
- `jquery perfect scrollbar 1.4.0`: Helps with custom scrollbars/scroll regions. Consider only when embedding a region that needs a custom scrollbar.
- `twitter bootstrap 5.3.3`: Provides ready-made components and layout utilities. Using the host's Bootstrap can speed up styling, but be careful about CSS collisions with the page. Scope styles under `#fmp-stadium-planner` where possible.
- `popper.js 2.9.2`: Useful only for complex popovers/tooltips. Use it when those interactions are required and the host provides it.
- `text clipper 2.2.0`: For truncating text; only relevant for UI elements that need clipping.

Recommendation:
- Do not bundle these libraries. Instead, detect and reuse the host page's globals when available (e.g. `window.jQuery`, `window.bootstrap`), and fall back to native DOM APIs if not present.
- When using host-provided libraries, document the runtime dependency in `README.md` and in the userscript metatags (if the dependency is required for correct behaviour).
- Prefer minimal, scoped CSS for injected UI (`#fmp-stadium-planner`) to avoid visual conflicts when reusing host styles.

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
