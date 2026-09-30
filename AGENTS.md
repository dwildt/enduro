# AGENTS.md

Single source of instructions for AI coding agents (Claude Code, GitHub Copilot, and others) working in this repository. Tool-specific files (`CLAUDE.md`, `.github/copilot-instructions.md`) only point here and add tool-specific notes.

## Project Overview

Enduro is a browser racing game inspired by Atari Enduro, with two modes chosen on a title screen inside an arcade cabinet:
- **CLASSIC** — 2D top-down lane racer, HTML5 Canvas 2D, 480x640.
- **OUTRUN** — pseudo-3D rear-view racer inspired by OutRun (Mega Drive), PixiJS, 320x224 upscaled.

Both share the same rules: 3 lanes, 3 lives, 2 power-ups, 4 phases from `LevelManager`. Stack and conventions are summarized in the README ("Tech Stack"); specs live in `specs/`.

## Rules (all agents)

- **Never `git push`.** Agents may commit; the repository owner reviews and pushes manually.
- **Lint and test before every commit:** `npm run lint && npm test`. For UI changes also run the app (see Verification).
- **Trunk-based:** work on `main`, no feature branches.
- **Keep changes minimal and focused.** No features, refactors or abstractions beyond the request.
- **English** for code, comments, commits, issues and specs (conversation with the owner may be in Portuguese).
- Match the surrounding code style: semicolons, single quotes, short comments only where the "why" is not obvious.

## Workflow: spec → issues → commits

1. **Plan / spec:** for a new feature or mode, write or update a spec in `specs/` (`<topic>-spec.md`: summary, decisions, architecture, controls, testing, future ideas). Record deviations from the original plan in the spec.
2. **Issues:** one GitHub issue per delivery (`gh issue create`), in English, with sections `## Description`, `## Requirements`, `## Acceptance Criteria` (checkboxes); link the spec. Labels: `enhancement`, `bug` or `documentation`.
3. **Commits:** one commit per issue, Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `chore:`), a short body with the key changes, and `Closes #N`. If a working file mixes two issues, stage each part separately.
4. **Docs:** update `AGENTS.md`, the README and the spec when behavior, controls or stack change.

## Commands

```bash
npm install            # dependencies (ESLint, Vite, PixiJS)
npm run dev            # Vite dev server (npm start is an alias)
npm run lint           # ESLint 9 on the whole repo (.js, .mjs, .cjs)
npm test               # all unit tests (tests/run-tests.js)
npm run build          # production build into dist/
npm run preview        # serve dist/ locally
node tests/test_<name>.js   # single CommonJS test
node tests/test_<name>.mjs  # single ES module test
```

## Verification

- Unit tests cover deterministic logic only (collision, spawning, scoring, levels, road projection, world rules, music data).
- For rendering, input or layout changes, run `npm run dev` and check in a browser (or headless screenshots) at least:
  - notebook 1366x657, phone portrait 390x844, phone landscape 844x390;
  - both modes, the mode select, pause and game over menus;
  - no console errors.
- Before the owner pushes: `npm run build && npm run preview` to check asset paths in the production build.

## Architecture

### Modules and tests
- `package.json` is `"type": "module"`: browser code is ES modules (`.js`).
- Legacy testable units are CommonJS (`src/*.cjs`) with CommonJS tests (`tests/test_*.js`); `tests/package.json` keeps `tests/` CommonJS.
- New pure logic is ESM without DOM/Pixi imports, tested by `tests/test_*.mjs` (loaded by `run-tests.js` via `import()`). Prefer this for new code.
- ESLint 9 flat config (`eslint.config.js`): `@eslint/js` recommended, semicolons, single quotes, unused args allowed, `_`-prefixed vars and caught errors ignored; `*.cjs` and `tests/**/*.js` parsed as CommonJS. Ignores live in the config (no `.eslintignore`).

### Boot and cabinet (`index.html`, `styles.css`, `src/boot.js`)
- `boot.js` shows the mode select (saved in localStorage `enduro_mode`) and lazy-loads `src/main.js` (CLASSIC) or `src/outrun/index.js` (OUTRUN).
- `#cabinet` wraps `.marquee`, `.bezel > .screen` (mode select, `#game`, `#outrun-root`) and a decorative `.control-panel`.
- `boot.js` sets `#cabinet[data-mode]` (`select` | `classic` | `outrun`), which drives the screen ratio (`--ratio` 4:3, 3:4, 10:7) and the theme (neon sunset / Atari woodgrain).
- Screen size is pure CSS: `min(viewport height - chrome, (viewport width - chrome) / ratio, 900px)`. Canvases are scaled, so pointer handlers must map coordinates with `canvas.width / rect.width`.
- Responsive: full cabinet on notebook/desktop; slim marquee + thin bezel without control panel on phone portrait; bezel only on short screens (`max-height: 520px`).
- Static assets live in `public/assets/` (served at `assets/...`).

### CLASSIC mode (`src/main.js` and friends)
- Fixed 60 Hz update loop (accumulator) with separate `update()` / `render()`.
- `entities/Car.js` (lane movement, 300 px/s interpolation), `entities/Obstacle.js`, `entities/Pickup.js`, `SpriteAnimation.js` (64x128 SVG sprite sheets, wheel animation).
- Lanes at 1/6, 3/6, 5/6 of the road (`computeLanePositions()`); road = canvas width - 128.
- Player fixed at y=540; obstacles spawn at y=-60; AABB collisions (32x48 hitboxes).
- Spawn: `Math.random() < spawnRate * dt`, random lane, per-lane `minGap`; speed `baseSpeed * 80 + random(0-60)` px/s.
- Car color selection: 5 SVG variants, `enduro_car_color`, `initializeCarWithColor()`, `startGame()`.
- Menus: `PAUSE_OPTIONS` (CONTINUE / RESTART / MENU), `GAME_OVER_OPTIONS` (RETRY / CHANGE COLOR), `selectMenuOption()`.

### OUTRUN mode (`src/outrun/`)
Pure logic (unit tested):
- `road.js` — segment road with eased curves/hills, `findSegment`, `heightAt`, `project()`; `LANE_X` = -2/3, 0, 2/3.
- `track.js` — looping course `buildTrack()` + `THEMES` per phase (palette + scenery kinds).
- `world.js` — lanes, speed (`BOOST_SPEED_MULTIPLIER` 1.4 during the score boost), traffic spawn, z/x collisions, lives, power-ups, score. `update(dt)` returns events: `hit`, `gameover`, `checkpoint`, `powerup`, `beep`, `skid`.

Rendering and flow (Pixi):
- `OutRunRenderer.js` — backdrops cross-faded per theme, road front-to-back with hill clipping, pooled sprites back-to-front.
- `sprites.js` — procedural pixel-art textures.
- `hud.js` — HUD and banners.
- `screens.js` — car select, radio select, pause and game over menus, local top 5 (`enduro_outrun_ranking`).
- `index.js` — app, loop, state machine (`color | radio | race | paused | gameover`), keyboard and touch input.

### Shared game rules
- `levelManager.js` (ESM) and `levelManager.cjs` (tests) define 4 phases:

  | Phase | Duration | Speed | Spawn | minGap |
  |---|---|---|---|---|
  | Country Roads | 20s | 1.0x | 0.4 | 120 |
  | Mountain Pass | 40s | 1.3x | 0.6 | 100 |
  | Desert Highway | 80s | 1.6x | 0.8 | 80 |
  | Night City Sprint | infinite | 2.0x | 1.0 | 60 |

- Lives 3, 1.5s invulnerability after a hit, score 10 pts/s.
- Power-ups every 10s: shield (5s) and score boost (8s: 2x score + 1.4x speed); beeps at 3/2/1s.

### Audio
- `SoundManager.js` — procedural Web Audio SFX (hit, checkpoint, game over, power-up, lane change, timer beep, skid) and engine (`startEngine`, `updateEngineBoost`, `setEngineSpeed`).
- `audio/MusicSequencer.js` + `audio/tracks.js` — FM step sequencer and 3 original tracks (16 tokens per bar).
- Mutes persisted: `enduro_sfx_muted`, `enduro_engine_muted`, `enduro_music_muted`.

### Controls (same in both modes)
| Key | Action |
|---|---|
| ←/→ or A/D | change lane / navigate menus |
| ↑/↓ or W/S | navigate menus |
| P / Space | open pause menu (P also continues) |
| Enter / Space | select menu option |
| M | music on/off (OUTRUN only) |
| E | engine sound on/off |
| C | car sounds (SFX) on/off |
| V | CRT scanlines (OUTRUN only) |
| Esc | back to mode select (OUTRUN) |
| R | unused |

## CI/CD

`.github/workflows/deploy.yml` runs on push to `main`: Node 22, `npm ci`, lint, test, `npm run build` (Vite, `base: './'`, bundles in `dist/bundle/`), then deploys `dist/` to GitHub Pages.
