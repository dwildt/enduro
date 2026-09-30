# OutRun Mode — Specification

Generated: 2026-09-30

## High-level summary
A second game mode for Enduro, inspired by OutRun on the Sega Mega Drive: a pseudo-3D rear-view racer with curves, hills, a sunset horizon, roadside scenery, an arcade HUD and FM-style chiptune music chosen on a "radio" screen. The classic top-down mode stays available and unchanged in gameplay; a title screen lets the player choose between **CLASSIC** and **OUTRUN**.

Reference: OutRun (Mega Drive) gameplay footage — https://youtu.be/4W30B4Cbsfc

## Decisions
- **Gameplay:** full pseudo-3D, keeping the existing rules: 3 logical lanes, 3 lives with 1.5s invulnerability after a hit, the two power-ups (shield, score boost) and the 4 LevelManager phases.
- **Stack:** PixiJS v8 (WebGL) for rendering, Vite for dev server, bundling and production build. No game engine; the pseudo-3D renderer is hand-written.
- **Coexistence:** a new selectable mode; the classic mode is lazy-loaded as-is.
- **Audio:** procedural chiptune with the Web Audio API (3 original tracks, no copyrighted music).
- **Resolution:** 320x224 (Mega Drive resolution), upscaled with pixelated CSS.

## Architecture

### Boot and build
- `index.html` loads `src/boot.js`, a DOM/CSS title screen (sunset-styled "ENDURO" logo, "Press Start 2P" font).
- CLASSIC → `import('./main.js')` (side-effect module, unchanged). OUTRUN → `import('./outrun/index.js')`.
- Selected mode persisted in localStorage (`enduro_mode`), used to pre-highlight the menu.
- Static assets moved to `public/assets/` so classic URLs (`assets/images/...`) keep working under Vite.
- `package.json` is `"type": "module"`; `tests/package.json` keeps tests CommonJS. ES module tests are `tests/test_*.mjs`, loaded by `run-tests.js` with `import()`.
- Vite config: `base: './'` (GitHub Pages sub-path), output `dist/`, bundles in `dist/bundle/`.
- CI (`deploy.yml`): Node 22, `npm ci`, lint, test, `npm run build`, publish `dist/`.

### OutRun modules (`src/outrun/`)
Pure logic (unit tested in Node):
- `road.js` — segment-based road ("Lou's Pseudo 3D" / Jake Gordon technique): `Road` with `addRoad/addStraight/addCurve/addHill/addDownhillToEnd` (eased curves and heights), `findSegment(z)` (looping, negative-safe), `heightAt(z)`, and `project()` (world → screen with a configurable horizon line). Constants: `SEGMENT_LENGTH=200`, `ROAD_WIDTH=1200` (half width), `CAMERA_HEIGHT=1000`, `DRAW_DISTANCE=200`, `LANE_X=[-2/3, 0, 2/3]`.
- `track.js` — `buildTrack()` looping course (ends at height 0) with roadside scenery slots, and `THEMES` keyed by phase id:
  1. Country Roads → COCONUT COAST (blue sky, palms, signs)
  2. Mountain Pass → MOUNTAIN PASS (afternoon sky, rocks, pines)
  3. Desert Highway → DESERT HIGHWAY (sand, cactus, mesas)
  4. Night City Sprint → NIGHT CITY (neon skyline, buildings, lamps)
- `world.js` — `World` game state: speed eases to `baseSpeed * 6000`, smooth lane interpolation, score (10 pts/s, x2 with boost), traffic spawn using phase `spawnRate` and `minGap` (px × 20 → world units), z/x overlap collisions, lives, power-ups every 10s (shield 5s, boost 8s, beeps at 3/2/1s). `update(dt)` returns events: `hit`, `gameover`, `checkpoint`, `powerup`, `beep`, `skid`. A hit removes the other car and drops speed to 30%.

Rendering and platform (PixiJS):
- `OutRunRenderer.js` — layers: banded sky + striped sun + 2 tiling parallax layers per theme (cross-faded over 2s on checkpoints); road drawn front-to-back in one `Graphics` with hill clipping (near edge clipped to `maxY`), alternating rumble/grass/lane stripes and distance fog; pooled sprites (scenery, traffic, pickups) placed back-to-front; rear-view player car with steer frames, bounce, hit blink and shield tint.
- `sprites.js` — procedural pixel-art textures drawn on small canvases: player car in the 5 existing colors × 3 steer frames, 4 traffic variants (incl. truck), pickups, palm/pine/rock/cactus/sign/building/lamp, sky and parallax backdrops per theme.
- `hud.js` — pixel-font HUD: SCORE, TIME (seconds to next checkpoint, `--` in the last phase), STAGE, lives as mini cars, power-up timer, tachometer + km/h + LO/HI gear, audio indicators (`M E R`, uppercase = on), banners ("GET READY... GO!", "CHECKPOINT!" + theme name), hit flash.
- `screens.js` — car color select → radio (music) select with FM dial → race → game over with local top 5 (`enduro_outrun_ranking`); pause screen.
- `index.js` — Pixi app, fixed 60 Hz update loop, state machine (`color | radio | race | paused | gameover`), attract-mode road behind menus, keyboard/pointer input, touch buttons on coarse-pointer or narrow screens, CRT overlay.

### Audio (`src/audio/`, `src/SoundManager.js`)
- `MusicSequencer.js` — look-ahead Web Audio step sequencer; 2-operator FM voices (lead, bass) and noise/sine drums; mute persisted in `enduro_music_muted`.
- `tracks.js` — SUNSET DRIVE, OCEAN BREEZE, NEON NIGHTS; 16 tokens per bar (`E5` note, `-` hold, `.` rest; drums `k s h`).
- `SoundManager.js` — new `setEngineSpeed(ratio)` (engine pitch follows speed; boost adds +0.3) and `playSkid()`; existing SFX reused (hit, checkpoint, power-up, timer beep, game over).

## Controls (standardized across modes)
| Key | CLASSIC | OUTRUN |
|-----|---------|--------|
| ←/→ or A/D | change lane | change lane / navigate menus |
| P / Space | pause / resume | pause / resume (Space also confirms in menus) |
| C | restart (opens color select) — racing, paused or game over | restart (car select) — racing, paused or game over |
| Enter | confirm color / retry after game over | confirm / retry after game over |
| M / E | SFX / engine | SFX / engine |
| R | — | radio (music) on/off |
| V | — | CRT scanlines on/off (`enduro_crt`) |
| Esc | — | back to mode select |

Touch (OUTRUN): `<` / `>` buttons at the bottom corners and `II` pause while racing; tap left/right thirds to navigate menus and the center to confirm; game over has RETRY and CAR buttons.

Pause screens in both modes show `P continue  C restart`.

## Deviations from the original plan
- Sprites are procedural (canvas-drawn pixel art) instead of new SVG files — no asset pipeline changes and easy per-color variants.
- CRT effect is a CSS overlay (scanlines + vignette) instead of `pixi-filters`, which looks better on the upscaled canvas; the dependency was removed.
- Music toggle moved from N to **R** (Radio); restart moved from R to **C** in both modes.

## Testing
- `tests/test_road.mjs` — easing, height continuity, loop closure, stripes, `findSegment` wrap, projection (bottom/center, perspective, camera offset), themes.
- `tests/test_world.mjs` — speed ramp, lane clamping/interpolation, scoring, hits/invulnerability/game over, lane separation, `minGap` spawning, pickups and beeps, shield, checkpoint + speed increase, reset.
- `tests/test_music.mjs` — note frequencies, holds/rests parsing, every bar has 16 valid steps.
- Manual: `npm run dev` — both modes, theme transitions, collisions, power-ups, pause/restart, radio tracks and mutes, mobile viewport; `npm run build && npm run preview` before pushing.

## Future ideas
- OutRun-style route forks at the end of each stage (choose left/right for the next theme).
- Partial sprite clipping behind hill crests (currently sprites mostly hidden are skipped).
- Accelerate/brake and free steering as an optional "arcade" setting.
