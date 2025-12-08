Enduro — 8-bit Obstacle Racing (vanilla JS)

Spec generated: 2025-12-05T23:58:37.330Z
Updated: 2025-12-08T12:54:32.074Z

Overview
A small, dependency-free browser prototype inspired by Atari Enduro. Built with plain ES modules and HTML5 <canvas>, the game is a 2D top-down/pseudo-3D obstacle racer with an 8-bit pixel-art aesthetic, responsive desktop and mobile controls, and 4 progressive phases.

Key features
- 8-bit pixel-art visual style; pixelated rendering and palette-friendly assets
- Simple, responsive controls: keyboard (arrow / A D), mouse click zones, and touch (tap/swipe)
- Four phases with increasing difficulty and themed visuals
- Obstacles and basic AI (lane-based spawner)
- Scoring, lives, and HUD (score, timer, phase, lives)
- Basic sound effects and simple visual polish (fade transitions)
- Tests (unit tests for core logic), ESLint configured, and CI to run lint + tests
- Deployable to GitHub Pages via Actions (docs/ or GitHub Actions artifact flow)

Project structure
- index.html — game mount and canvas
- styles.css — base styling and pixelated rendering flag
- src/ — game source (ES modules and some CommonJS test helpers)
  - main.js
  - input.cjs / input.js
  - score.cjs / hud.cjs
  - collision.cjs
  - levelManager.cjs
  - spawner.cjs
  - assetLoader.cjs
  - sound.cjs
  - entities/
    - Car.js
    - Obstacle.js
- tests/ — unit tests used by `npm test`
- docs/ — static files published by GitHub Pages (index.html proof)
- .github/workflows/ — CI and deploy workflows
- specs/ — project and issue specifications

NPM scripts (local development)
- npm install            # install dependencies (dev + prod)
- npm run lint           # run ESLint over src/ and tests/
- npm test               # run unit tests (node-based test runner)
- npm start              # quick preview (runs: npx serve .)

Workflow & contribution notes
- Trunk-based development: work is done on the main branch per project policy when using Copilot CLI.
- Always run lint and tests before committing changes locally: npm run lint && npm test
- Commits created by the Copilot CLI should include tests passing locally; pushing remains a manual step by the repository owner.
- Convert specs into issues (specs/ contains issues and templates) and use the .github/ISSUE_TEMPLATE templates when creating new issues via the UI or gh CLI.

CI & GitHub Pages
- CI runs ESLint and tests on push/PR; see .github/workflows/ci.yml.
- Pages deployment is automated via .github/workflows/deploy.yml and publishes docs/ to your Pages site. Ensure Pages settings allow GitHub Actions deployments.

Contact
- See .github/copilot-instructions.md for Copilot CLI usage guidelines and repository-specific rules.
