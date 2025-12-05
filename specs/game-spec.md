# Enduro-style 2D Obstacle Racing — Game Specification

Generated: 2025-12-05T12:15:50.234Z

## High-level summary
A small 2D top-down / pseudo-3D arcade racing game inspired by Atari "Enduro" implemented in vanilla JavaScript using the HTML5 <canvas>. The player controls a car and must avoid obstacles and traffic while progressing through 4 distinct phases (levels). Each phase increases difficulty and introduces new hazards and visual themes.

## Goals
- Lightweight, dependency-free (vanilla JS) prototype playable in the browser
- Clear code separation: game loop, input, entities, levels, rendering, asset loading
- Four phases with progressive difficulty and transitions
- Basic HUD: score, lives, phase indicator, timer
- Responsive controls for both desktop and mobile
- 8-bit visual style (retro pixel-art) for a classic arcade look
- Test suite, linting, and CI configured; deployable to GitHub Pages via Actions

## Technical architecture
- index.html — canvas and game mount
- src/main.js — game initialization and loop (update & render)
- src/input.js — keyboard & touch handling
- src/entities/Car.js — player car logic
- src/entities/Obstacle.js — obstacle / traffic vehicles
- src/levelManager.js — phase data, spawn rules, transitions
- src/collision.js — collision detection (AABB)
- src/assetLoader.js — images & audio preloader
- src/hud.js — draw score, lives, phase
- assets/{images,sfx}

Keep modules small and plain ES modules (no build step required).

## Core mechanics
- Player controls: left/right (arrow keys or A/D) to change lane/position; optional accelerate/brake
- Camera: static top-down or simple vertical scroll to simulate forward movement
- Obstacles move toward the player (or the player moves forward and obstacles spawn)
- Collision: touching an obstacle reduces life and briefly invulnerable
- Scoring: points for distance travelled and for successful overtakes; bonus for completing a phase
- Lives: 3 starting lives; game over at 0

## Controls (Desktop & Mobile)
Design goal: make controls intuitive and responsive on both desktop and mobile while keeping input handling centralized (input.js) so the same game logic works for all devices.

Desktop (Keyboard & Mouse)
- Primary: Left / Right arrow keys or A / D to steer between lanes.
- Secondary: Space to brake (optional), Enter to pause/start, R to restart.
- Mouse: clicking or tapping the left half of the canvas steers left, right half steers right — useful for desktop users who prefer clicking.
- Input behavior: support key hold for continuous steering and smooth interpolation for visuals (no instant teleport when changing lanes unless lane-based snap is intended).

Mobile (Touch & Gestures)
- Tap zones: tap left side of canvas to move left, tap right side to move right — simple and reliable.
- Swipe gestures: short swipe left/right for a quick lane change; swipe up can be mapped to accelerate and swipe down to brake if needed.
- On-screen controls: optional visible buttons for left / right / brake / accelerate placed at screen edges for players who prefer tactile buttons.
- Touch hold: pressing and holding a side button or zone should continuously steer in that direction (matching keyboard hold behavior).
- Accessibility: provide an option in settings to enable larger touch targets, inverted controls, or single-tap-to-toggle lane.

Input common patterns & notes
- Input abstraction: input.js translates raw events into high-level actions (moveLeft, moveRight, brake, pause) so gameplay code remains device-agnostic.
- Debounce buffer: short input buffering (e.g., 150ms) to accept slightly early taps during animations/transitions.
- Smooth vs. discrete lanes: implement an interpolation system so that whether the player uses a tap, key, or swipe, the car transitions smoothly between positions; optionally expose a config flag for instant lane snap for a more arcade feel.
- Pointer events: use PointerEvent where available for unified mouse/touch handling and better multi-touch support.

## Difficulty & progression
- Difficulty scales by spawn rate, obstacle speed, and variety
- Each phase increases base speed and spawn frequency and introduces new obstacle types
- Phases also modify background/road visuals and target conditions (e.g., survive X seconds)

## Phases (4)
Phase 1 — Country Roads (Tutorial)
- Theme: light road, sparse scenery
- Mechanics: introduce lanes, basic traffic (slow cars)
- Difficulty: low spawn rate, low speed
- Objective: reach 60 seconds or a distance/score target to advance

Phase 2 — Mountain Pass
- Theme: curvy/rocky visuals, narrower road
- Mechanics: faster vehicles, occasional stationary obstacles
- Difficulty: moderate spawn rate, medium speed
- Objective: survive 90 seconds / increase score threshold

Phase 3 — Desert Highway
- Theme: open desert, heat haze effects
- Mechanics: faster traffic, moving obstacles that change lanes
- Difficulty: high spawn rate, fast speed, occasional multiple obstacles
- Objective: survive 120 seconds / higher score threshold

Phase 4 — Night City Sprint (Final)
- Theme: city at night, lights, tighter spacing
- Mechanics: highest enemy density, special hazards (e.g., oil slicks) that temporarily reduce handling
- Difficulty: very high spawn rate and speed
- Objective: complete final distance/time; endgame score & summary

Transitions
- Simple fade-out/fade-in or phase title overlay between phases
- Brief score/lives carryover and a small heal or bonus between phases if desired

## Obstacles and enemy behavior
- Types: slow car, fast car, stationary object, zig-zag mover, obstacle clusters
- Spawn logic: lane-based spawner with randomness weighted by phase difficulty
- Behavior: deterministic/simple AI (fixed speed, occasional lane changes)

## Assets
- Minimal placeholder sprites (rectangle + simple car icon) to start
- Optional pixel-art or vector sprites later
- SFX: crash, checkpoint, phase transition, engine hum (optional)

## UX & HUD
- Top-left: lives and current phase
- Top-right: score and timer
- Center overlays: phase title / "Game Over" / "Paused"
- Simple start menu and restart flow

## Testing, Linting & CI
Goal: maintain code quality and catch regressions early. Add lightweight test and linter setup and a CI workflow that runs them on push/PR.

- Testing
  - Use Jest for unit tests of pure game logic (spawn rules, collision detection, level progression). Place tests in `tests/` or `__tests__/`.
  - Keep DOM-free logic in modules so tests run fast without a browser; use jsdom for any renderer-related tests if needed.
  - npm scripts: `npm test` -> `jest`

- Linting
  - Use ESLint with an opinionated base (e.g., `eslint:recommended`) and a small .eslintrc.js config for ES modules and browser environment.
  - npm scripts: `npm run lint` -> `eslint "src/**/*.js"`

- CI (GitHub Actions)
  - Workflow (`.github/workflows/ci.yml`) runs on push and pull_request and includes:
    - checkout
    - setup-node
    - npm ci
    - npm run lint
    - npm test
  - Fail the workflow on lint or test failures.

## GitHub Pages deployment (via Actions)
Goal: publish the playable prototype to GitHub Pages automatically from main branch or a dedicated `gh-pages` branch.

Two recommended approaches:

1) docs/ branch (simplest)
- Keep distributable files (index.html, styles.css, assets/) in a `docs/` folder on the default branch.
- GitHub Pages serves the `docs/` folder automatically.
- Add a workflow (`.github/workflows/deploy.yml`) that runs on push to main and copies fresh build or files into `docs/` (if a build step exists), otherwise ensure the repo root files are present in `docs/`.

2) gh-pages branch (automated deploy)
- Use the `peaceiris/actions-gh-pages` action to push built/dist files to `gh-pages` branch.
- Workflow steps: checkout, setup-node, npm ci, npm run build (if necessary), run tests/lint, use `actions-gh-pages` to publish the `build/` or `public/` folder.

Example minimal deploy workflow (deploy.yml)
- name: Deploy to GitHub Pages
  on:
    push:
      branches: [ main ]
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v4
          with: { node-version: '18' }
        - run: npm ci
        - run: npm run build # optional
        - uses: peaceiris/actions-gh-pages@v3
          with:
            github_token: ${{ secrets.GITHUB_TOKEN }}
            publish_dir: ./docs # or ./build

Notes:
- For a zero-build project, simply ensure `index.html` and `assets` exist in `docs/` and the action can skip the build step.
- Make sure `homepage` or documentation in README explains the Pages URL and that the repo has Pages enabled for `docs/`.

## UX & HUD
- Top-left: lives and current phase
- Top-right: score and timer
- Center overlays: phase title / "Game Over" / "Paused"

## Testing & acceptance criteria
- Player can move left/right and collide with obstacles correctly
- Score increases with distance and overtakes; lives decrement on collisions
- Phase transitions trigger at targets and difficulty changes occur
- Unit tests cover collision and spawn logic
- Linting passes on CI
- GitHub Pages successfully serves the built prototype

## Milestones (suggested)
1. Project scaffold + canvas + game loop (1 day)
2. Player car + controls + rendering (1 day)
3. Obstacle spawner + collision + HUD (2 days)
4. Phase system + transitions + difficulty tuning (2 days)
5. CI + Pages deployment + polish (1-2 days)

## Folder structure (suggested)
- index.html
- styles.css
- src/
  - main.js
  - input.js
  - assetLoader.js
  - levelManager.js
  - collision.js
  - hud.js
  - entities/
    - Car.js
    - Obstacle.js
- assets/
  - images/
  - sfx/
- tests/
- docs/ (optional for GitHub Pages)
- .github/workflows/
- specs/
  - game-spec.md (this file)

## Implementation notes & tips
- Keep timestep fixed for physics and separate rendering interpolation
- Start with placeholder rectangles for cars and obstacles; replace art later
- Expose tuning constants (spawn rates, speeds, lane count) in a single config file for easy balancing
- Keep DOM-free logic small and pure to facilitate unit testing with Jest

---
Next step: scaffold the repo (index.html, src/, basic main.js and input.js) and add package.json with scripts for test and lint. Would you like scaffolding now?
