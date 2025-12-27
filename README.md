# FMP Stadium Planner

A Tampermonkey userscript that helps planning stadium upgrades on Football Manager Project (FMP) browser game. It will be triggered in the Stadium page.

## Features
- Shows maximum income for your stadium in league games
- A work plan that, given the required number of seats, distributes them by sector, according to the 1-4-8-16 ratio for VIP, covered, standard, and standing sectors, showing also expected maximum income
- A visualization of the current and expected maximum income, both with and without season tickets
- A visualization of the expected maintenance costs
- A visualization of the expected cost and duration of works for a given work plan, broken down by sector and total, as well as the new expected maximum income

### Planned features (WIP)
- Customizable ratio for planning
- Advanced planning, let you choose the exact amount of seats for each sector
- (optional) A visualization of the current and expected maximum income with or without the new planned season tickets
- (optional) A forecast of the future maximum income from the food and beverage sector with the new work plan, compared with current one

## Usage
1. Clone this repository.
1. Run `npm install` to install or the required dependencies
1. Edit the TypeScript sources in `src` folder and build it with `npm run build` to check everything build correctly.
1. Generate the final js script running `npm run bundle`
1. Copy the generated `dist/fmp-stadium-planner.js` into a new Tampermonkey script in your browser.
1. Visit the FMP stadium page to see the result.

## Installation

### Greasyfork (Recommended)
1. Go to the [Greasyfork page](https://greasyfork.org/en/scripts/559696-fmp-stadium-planner) and click the install button below:

  [![Install from Greasyfork](https://img.shields.io/badge/install-greasyfork-brightgreen?logo=greasyfork)](https://update.greasyfork.org/scripts/559696/FMP%20Stadium%20Planner.user.js)

2. The script will be automatically added to Tampermonkey and kept up to date.
3. Visit the FMP Stadium page (`https://footballmanagerproject.com/Economy/Stadium`) to use the tool.

### GitHub Release (Alternative)
1. Go to the [latest GitHub Release](https://github.com/napcoder/fmp-stadium-planner/releases/latest) and download `fmp-stadium-planner.user.js` from the `dist/` folder.
2. Open Tampermonkey in your browser and create a new script.
3. Paste the contents of `fmp-stadium-planner.user.js` and save.
4. Visit the FMP Stadium page to use the tool.

#### Automatic Updates
- The userscript includes metatags for automatic updates via GitHub Releases:
  ```js
  // @updateURL   https://github.com/napcoder/fmp-stadium-planner/releases/latest/download/fmp-stadium-planner.user.js
  // @downloadURL https://github.com/napcoder/fmp-stadium-planner/releases/latest/download/fmp-stadium-planner.user.js
  ```

## Release & Distribution
- The final userscript bundle is located in the `dist/` folder and versioned for distribution.
- The project uses semantic versioning (Major.Minor.Patch) for releases. The minor version increases for each planned feature (WIP) completed, until reaching 1.0.0.
- For each release:
	1. Update the `@version` field in `userscript-metatags.js` (format: Major.Minor.Patch, e.g. 0.1.0).
	2. Run `npm run bundle` to generate the latest script.
	3. Upload the new bundle to a GitHub Release.
	4. Optionally, update the Greasyfork listing to point to the raw GitHub file for automatic updates.

## Bootstrap integration
This userscript leverages Bootstrap 5 classes and layout utilities (as provided by the host site) for responsive UI and modern styling. No Bootstrap code is bundled; the script assumes Bootstrap 5.3+ is already loaded on the target page.

## License
MIT
