# OutRun Mode — Specification

Generated: 2026-09-30

## High-level summary
A second game mode for Enduro, inspired by OutRun on the Sega Mega Drive: a pseudo-3D rear-view racer with curves, hills, a sunset horizon, roadside scenery, an arcade HUD and FM-style chiptune music chosen on a "radio" screen. The classic top-down mode stays available and unchanged in gameplay; a title screen lets the player choose between **CLASSIC** and **OUTRUN**.

Reference: OutRun (Mega Drive) gameplay footage — https://youtu.be/4W30B4Cbsfc

## Decisions
- **Gameplay:** full pseudo-3D, keeping the existing rules: 3 logical lanes, 3 lives with 1.5s invulnerability after a hit, the two power-ups (shield, score boost) and the 4 LevelManager phases.
- **Stack:** PixiJS v8 (WebGL) for rendering, Vite for dev server, bundling and production build. No game engine; the pseudo-3D renderer is hand-written.
- **Coexistence:** a new selectable mode; the classic mode is lazy-loaded as-is.
- **Audio:** procedural chiptune with the Web Audio API — original tracks and rock arrangements of public-domain classical pieces only (no copyrighted music; style-inspired originals instead).
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
- `world.js` — `World` game state: speed eases to `baseSpeed * 6000`, smooth lane interpolation, score (10 pts/s, x2 with boost), traffic spawn using phase `spawnRate` and `minGap` (px × 20 → world units), z/x overlap collisions, lives, power-ups every 10s (shield 5s; boost 8s = x2 score and x1.4 car speed via `BOOST_SPEED_MULTIPLIER`; beeps at 3/2/1s). Traffic speed uses the non-boosted phase speed. `update(dt)` returns events: `hit`, `gameover`, `checkpoint`, `powerup`, `beep`, `skid`. A hit removes the other car and drops speed to 30%. Traffic changes lanes via the shared `src/laneChange.js` (phase `laneChangeRate`), only 9000-18000 world units ahead so the change happens where the car is visible; `sprites.js` provides blinker frames (amber tail light on the side of the move) used by the renderer while `car.change` is set.

Rendering and platform (PixiJS):
- `OutRunRenderer.js` — layers: banded sky + striped sun + 2 tiling parallax layers per theme (cross-faded over 2s on checkpoints); road drawn front-to-back in one `Graphics` with hill clipping (near edge clipped to `maxY`), alternating rumble/grass/lane stripes and distance fog; pooled sprites (scenery, traffic, pickups) placed back-to-front; rear-view player car with steer frames, bounce, hit blink and shield tint.
- `sprites.js` — procedural pixel-art textures drawn on small canvases: player car in the 5 existing colors × 3 steer frames, 4 traffic variants (incl. truck), pickups, palm/pine/rock/cactus/sign/building/lamp, sky and parallax backdrops per theme.
- `hud.js` — pixel-font HUD: SCORE, TIME (seconds to next checkpoint, `--` in the last phase), STAGE, lives as mini cars, power-up timer, tachometer + km/h + LO/HI gear, audio indicators (`M E C` = music, engine, car sounds; uppercase = on), banners ("GET READY... GO!", "CHECKPOINT!" + theme name), hit flash.
- `screens.js` — car color select → radio (music) select with FM dial → race → game over with local top 5 (`enduro_outrun_ranking`); pause screen.
- `index.js` — Pixi app, fixed 60 Hz update loop, state machine (`color | radio | race | paused | gameover`), attract-mode road behind menus, keyboard/pointer input, touch buttons on coarse-pointer or narrow screens, CRT overlay.

### Audio (`src/audio/`, `src/SoundManager.js`)
- `MusicSequencer.js` — look-ahead Web Audio step sequencer; 2-operator FM voices (lead, bass) and noise/sine drums; mute persisted in `enduro_music_muted`.
- `tracks.js` — 7 radio stations, 16 tokens per bar (`E5` note, `-` hold, `.` rest; drums `k` kick, `s` snare, `h` hat, `x` scratch); each has `name` and `genre`; optional `guitar` channel (distorted power chord: root + fifth + octave sawtooths → waveshaper → lowpass) and `bpmEnd`/`bpmStep` (tempo rises every loop):

  | Station | Genre | Source |
  |---|---|---|
  | SUNSET DRIVE | synth pop | original |
  | OCEAN BREEZE | latin fusion | original |
  | NEON NIGHTS | synthwave | original |
  | THUNDER HIGHWAY | hard rock (80s arena) | original |
  | IRON GROOVE | funk metal (syncopated riff, stop hits, scratches) | original |
  | MOUNTAIN KING | rock, speeds up 108 → 200 bpm | Grieg, In the Hall of the Mountain King (public domain) |
  | TOCCATA IN D | organ intro + hard rock section | J.S. Bach, Toccata in D minor BWV 565 (public domain) |
- Radio screen: FM dial sweeps 88.1–107.9 across the stations; shows the station name, genre and one dot per station.
- `SoundManager.js` — new `setEngineSpeed(ratio)` (engine pitch follows speed; boost adds +0.3) and `playSkid()`; existing SFX reused (hit, checkpoint, power-up, timer beep, game over).

## Controls (standardized across modes)
| Key | CLASSIC | OUTRUN |
|-----|---------|--------|
| ←/→ or A/D | change lane / navigate menus | change lane / navigate menus |
| ↑/↓ or W/S | navigate menus | navigate menus |
| P / Space | open pause menu (P also continues) | open pause menu (P also continues) |
| Enter / Space | select menu option | select menu option |
| M | — (no music) | music on/off |
| E | engine on/off | engine on/off |
| C | car sounds (SFX) on/off | car sounds (SFX) on/off |
| R | — (free) | — (free) |
| V | — | CRT scanlines on/off (`enduro_crt`) |
| Esc | — | back to mode select |

**Menus (no shortcut keys):**
- Pause: CONTINUE / RESTART (car select) / MENU (mode select)
- Game over: RETRY (same car) / CAR (CHANGE COLOR in classic)

The selected option is highlighted and the others are dimmed; options can also be clicked/tapped.

Touch (OUTRUN): `<` / `>` buttons at the bottom corners and `II` pause at the top-left (below SCORE) while racing; tap left/right thirds to navigate the car/radio screens and the center to confirm; tap pause/game over options directly.

## Deviations from the original plan
- Sprites are procedural (canvas-drawn pixel art) instead of new SVG files — no asset pipeline changes and easy per-color variants.
- CRT effect is a CSS overlay (scanlines + vignette) instead of `pixi-filters`, which looks better on the upscaled canvas; the dependency was removed.
- Key scheme revised after playtesting: **M** music, **E** engine, **C** car sounds (SFX); restart and car change moved into the pause/game over menus; **R** left free. (Intermediate versions used N/R for music and C/R for restart.)

## Arcade cabinet
Both modes (and the mode select) are shown inside an arcade cabinet built with HTML/CSS:
- Marquee (backlit "ENDURO" + mode name), bezel with CRT glass reflection, decorative control panel (joystick, 2 buttons, INSERT COIN slot).
- Same Atari-style woodgrain cabinet for every mode; only the marquee stripes change: select red/orange/yellow (road of the 1983 box art), CLASSIC orange/red, OUTRUN cyan/magenta/purple (magenta trim).
- Mode select screen: cover-art layout mixing the Atari box art and the OutRun sunset — green background, white title, yellow "SELECT MODE", selected button red with yellow border and unselected buttons dimmed cream, inline SVG art (grid paper, night sky with moon fading into a striped sunset with a palm, red/orange/yellow road, player car), footer "8-BIT CLASSIC / 16-BIT OUTRUN". No third-party logos or brand names.
- The screen keeps the game ratio (select 4:3, classic 3:4, outrun 10:7) and takes the largest size that fits the viewport minus the cabinet chrome (CSS `min()`/`calc()` with `100dvh`/`100vw`).
- Layouts: notebook/desktop full cabinet; phone portrait slim marquee + thin bezel, no control panel (touch controls are on screen); short/landscape phone screens bezel only.
- Classic pointer/touch coordinates are scaled from the displayed size to canvas pixels.

## Testing
- `tests/test_road.mjs` — easing, height continuity, loop closure, stripes, `findSegment` wrap, projection (bottom/center, perspective, camera offset), themes.
- `tests/test_world.mjs` — speed ramp, lane clamping/interpolation, scoring, hits/invulnerability/game over, lane separation, `minGap` spawning, pickups and beeps, shield, checkpoint + speed increase, reset.
- `tests/test_music.mjs` — note frequencies, holds/rests parsing, every bar has 16 valid steps, valid drum hits, aligned channel loops, unique names/genres that fit the screen, tempo ramp clamps at `bpmEnd`.
- Manual: `npm run dev` — both modes, theme transitions, collisions, power-ups, pause/restart, radio tracks and mutes, mobile viewport; `npm run build && npm run preview` before pushing.

## Future ideas
- OutRun-style route forks at the end of each stage (choose left/right for the next theme).
- Partial sprite clipping behind hill crests (currently sprites mostly hidden are skipped).
- Accelerate/brake and free steering as an optional "arcade" setting.
