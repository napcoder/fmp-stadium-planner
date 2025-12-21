
# FMP Stadium Planner - AI Instructions

**Note: This file must be edited and maintained exclusively by the AI assistant. Manual edits are discouraged to ensure consistency and up-to-date automation. All additions and changes must be written in English. Every time the AI assistant learns something new about the project, this knowledge must be added to this file.**

## Project Overview
FMP Stadium Planner is a Tampermonkey userscript that helps planning stadium upgrades on the Football Manager Project (FMP) browser game. It shows the maximum income for your stadium in league games, based on seat types (standing, standard, covered, VIP) and their respective multipliers. All calculations use the ⓕ currency symbol (not $).

## Architecture
- **Source**: Modular TypeScript in `src/` (main: `src/index.ts`, logic: `src/stadium.ts`, i18n: `src/i18n.ts`)
- **Bundler**: Rollup (see `rollup.config.mjs`)
- **Metadata header**: `userscript-metatags.js` (imported as a banner in Rollup)
- **Output**: Single bundle ready for Tampermonkey in `dist/` (e.g., `dist/fmp-stadium-planner.user.js`)
- **Core class**: `Stadium` - manages seat counts and multipliers
- **Entry point**: IIFE for userscript isolation

## Key Patterns & Conventions

### Stadium Multipliers (Fixed Constants)
Defined as static class properties in `Stadium`:
- Standing: 1x base ticket price
- Standard: 2x base ticket price
- Covered: 4x base ticket price
- VIP: 12x base ticket price

**Example usage:**
```js
const stadium = new Stadium(11040, 5520, 2760, 690);
stadium.calcMaxIncome(28); // Calculates with 28 ⓕ base ticket
```

### Constructor Pattern
The Stadium constructor takes 4 positional arguments: `standing, standard, covered, vip`. No validation or default values—assumes valid positive integers.

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

## Best Practices & Publishing
- Keep the IIFE wrapper for userscript isolation
- Use static block syntax for multipliers (ES2022)
- Output via `console.log()` for debugging
- Always update `@version` in `userscript-metatags.js`
- Version and commit the `dist/` folder for distribution
- Always use the ⓕ currency symbol (not $) in all outputs and documentation

### Publishing (Greasyfork + GitHub)
- Upload the bundle from `dist/` to a GitHub Release
- Include the `@updateURL` and `@downloadURL` metatags pointing to the raw file on GitHub (see example below)
- On Greasyfork, use the raw GitHub URL as the source for automatic updates
- Always update the `@version` field in `userscript-metatags.js` using semantic versioning (Major.Minor.Patch).

**Example metatag for combined distribution:**
```js
// @updateURL   https://github.com/napcoder/fmp-stadium-planner/releases/latest/download/fmp-stadium-planner.user.js
// @downloadURL https://github.com/napcoder/fmp-stadium-planner/releases/latest/download/fmp-stadium-planner.user.js
```

### README & Badge
- Add a Greasyfork install badge and direct link to the GitHub Release
- Document the pipeline and the automatic update mechanism

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
