# Enduro - 8-bit Obstacle Racing

![Deploy Status](https://github.com/dwildt/enduro/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)

**[▶️ Play Now](https://dwildt.github.io/enduro)**

## About

Enduro is a browser-based racing game inspired by the classic Atari Enduro, presented inside a retro arcade cabinet. Pick one of two modes on the title screen:

- **CLASSIC** — the original 2D top-down lane racer (HTML5 Canvas, 8-bit pixel art).
- **OUTRUN** — a pseudo-3D rear-view racer inspired by OutRun on the Sega Mega Drive: curves, hills, sunset horizons, roadside scenery, arcade HUD and FM-style chiptune radio (PixiJS).

Both modes share the same rules: three lanes, lives, power-ups and four progressive phases.

- **Light stack** - Vanilla JavaScript ES modules, PixiJS for the OutRun renderer, Vite for dev/build; no game framework
- **Retro aesthetic** - Pixel-art rendering, Mega Drive resolution (320x224) in OutRun mode, optional CRT scanlines
- **Cross-platform** - Keyboard, mouse and touch; cabinet layout adapts to notebooks and phones
- **CI/CD** - Automated lint, tests, build and deployment via GitHub Actions

## Features

- 🕹️ **Arcade cabinet** around the screen (woodgrain, marquee with per-mode stripes, CRT bezel, control panel) and a cover-art title screen mixing the Atari box art and the OutRun sunset
- 🌅 **OutRun mode** with pseudo-3D road, 4 themed stages (coast, mountains, desert, neon city) and a local top 5
- 📻 **Radio select** with 7 FM-style stations (procedural Web Audio, no audio files): synth pop, latin fusion, synthwave, hard rock, funk metal and rock arrangements of Grieg and Bach
- 🎮 **8-bit pixel-art visual style** with retro color palettes
- ⌨️ **Multiple control schemes** - keyboard, mouse, and touch support
- 🏁 **4 progressive phases** with increasing difficulty and themed environments
- ❤️ **Lives system** with invulnerability timer after hits
- 🎯 **Time-based scoring** - survive longer to score higher
- 🚗 **Lane-based gameplay** with smart obstacle spawning
- ✅ **Unit tested** core game logic
- 🚀 **Auto-deployed** to GitHub Pages on every push

## Controls

### Desktop
| Input | Action |
|-------|--------|
| **Arrow Keys** or **A/D** | Switch lanes left/right |
| **Space** or **P** | Pause menu: Continue / Restart / Menu |
| **Arrows** + **Enter** | Choose an option in the pause and game over menus (Retry / Change car) |
| **M** | Toggle music (OutRun mode) |
| **E** | Toggle engine sound |
| **C** | Toggle car sounds (sound effects) |
| **V** | Toggle CRT scanlines — old TV look (OutRun mode) |
| **Esc** | Back to mode select (OutRun mode) |
| **Mouse Click** | Click left/right side to switch lanes; click menu options |

The mode select screen uses **↑/↓** + **Enter** (or click). **R** is currently unused.

### Mobile / Touch Devices
| Input | Action |
|-------|--------|
| **On-screen buttons** | Tap left/right arrows at the bottom corners to change lanes |
| **Pause button** | CLASSIC: bottom center (next to the sound buttons); OUTRUN: top-left, below the score |
| **Sound buttons** | CLASSIC: bottom center (car sounds and engine) |
| **Menus** | Tap the options directly (pause, game over, mode select); in OutRun car/radio screens tap left/right thirds to browse and the center to confirm |
| **Swipe left/right** | CLASSIC on larger touch screens: swipe to change lanes |

**Note:** On-screen buttons appear automatically on touch devices and narrow viewports (under 768px width). On phones the cabinet is slimmer (portrait) or reduced to the bezel (landscape).

## Power-ups

Collect power-ups to gain temporary advantages:

- 🛡️ **Shield (Blue)** - 5 seconds of invulnerability
- ⚡ **Boost (Orange)** - 8 seconds of 2x score multiplier and 1.4x speed

Power-ups spawn every 10 seconds in random lanes. The HUD shows the active power-up and remaining time.

## Gameplay

Navigate through traffic by switching between three lanes. Avoid obstacles to survive and progress through four increasingly challenging phases (in OutRun mode each phase is a stage with its own scenery: Coconut Coast, Mountain Pass, Desert Highway, Night City):

### Phase 1: Country Roads
- **Duration:** 20 seconds
- **Speed:** 1.0x
- **Spawn Rate:** 0.4/second
- **Theme:** Rural roads with earth tones

### Phase 2: Mountain Pass
- **Duration:** 40 seconds
- **Speed:** 1.3x
- **Spawn Rate:** 0.6/second
- **Theme:** Mountainous terrain with earthy palette

### Phase 3: Desert Highway
- **Duration:** 80 seconds
- **Speed:** 1.6x
- **Spawn Rate:** 0.8/second
- **Theme:** Sandy desert roads

### Phase 4: Night City Sprint
- **Duration:** Endless
- **Speed:** 2.0x
- **Spawn Rate:** 1.0/second
- **Theme:** Dark urban environment

**Lives:** You start with 3 lives. After taking damage, you have 1.5 seconds of invulnerability.

**Scoring:** Earn 10 points per second survived. Can you reach Phase 4?

**Visual Cues:** Obstacle cars are color-coded by speed:
- 🟢 Green tint = Slower cars (easier to avoid)
- 🟡 Yellow tint = Medium speed cars
- 🔴 Red tint = Fast cars (hardest to avoid)

## Development

### Prerequisites

- Node.js 22 (same as CI) for Vite, tests and ESLint
- Modern browser with ES modules and WebGL (OutRun mode)

### Getting Started

```bash
# Install dependencies
npm install

# Start local development server (Vite)
npm run dev
# Game will be available at http://localhost:5173

# Run tests
npm test

# Run linter
npm run lint

# Pre-commit check (recommended)
npm run lint && npm test

# Production build (dist/) and local preview
npm run build && npm run preview

# Visual smoke test: screenshots of both modes at notebook/phone viewports (.verify-ui/)
# Local only, not run in CI by design
npm run verify:ui
```

### Tech Stack

| Layer | Technology | Version | Used for |
|-------|------------|---------|----------|
| Language | JavaScript (ES modules) | ES2021 | All game code; `"type": "module"` |
| CLASSIC rendering | HTML5 Canvas 2D | — | Top-down mode (`src/main.js`), SVG sprite sheets |
| OUTRUN rendering | [PixiJS](https://pixijs.com/) | ^8.21 | WebGL renderer, sprites, text, tiling backgrounds (`src/outrun/`) |
| Audio | Web Audio API | — | Procedural SFX, engine and FM music sequencer (no audio files) |
| UI shell | HTML + CSS | — | Mode select and arcade cabinet (CSS variables, `min()`/`calc()`, container queries) |
| Fonts | Press Start 2P (Google Fonts) | — | Pixel font for cabinet, menus and OutRun HUD |
| Dev server / build | [Vite](https://vite.dev/) | ^7.3 | `npm run dev`, bundling PixiJS, `dist/` build (`base: './'`) |
| Tests | Node.js built-in `assert` + `tests/run-tests.js` | Node 22 | Unit tests for pure logic (`.js` CommonJS, `.mjs` ES modules) |
| UI checks | [Playwright](https://playwright.dev/) + system Chrome | ^1.63 | `npm run verify:ui` screenshots at 3 viewports, fails on console errors/overflow |
| Lint | ESLint (flat config, `eslint.config.js`) | ^9.39 | `@eslint/js` recommended, semicolons, single quotes; lints the whole repo |
| CI/CD | GitHub Actions + GitHub Pages | — | Lint, test, build and deploy on push to `main` |

#### Patterns for future evolution

- **Pure logic first:** game rules, geometry and data go in DOM/Pixi-free ES modules (e.g. `src/outrun/road.js`, `world.js`) with `tests/test_*.mjs` tests. Rendering and input stay thin on top.
- **Events out of the simulation:** world updates return events (`hit`, `checkpoint`, ...) that the UI maps to sounds, banners and effects.
- **Fixed 60 Hz update loop** with an accumulator; rendering runs every animation frame.
- **Procedural assets** where possible (Pixi textures drawn on canvases, Web Audio sounds and music) to avoid asset pipelines.
- **Shared rules** come from `LevelManager` (phases, speed, spawn rate, min gap); new modes should reuse it.
- **Layout in CSS:** the cabinet sizes the screen; canvases are scaled, so map pointer coordinates to canvas pixels.
- **Persist preferences** in `localStorage` with the `enduro_` prefix.
- **Specs and issues:** new features start with a spec in `specs/` and one GitHub issue per delivery (see [AGENTS.md](AGENTS.md)).

### Project Structure

```
enduro/
├── index.html              # Cabinet markup + mode select, loads src/boot.js
├── styles.css              # Cabinet, mode select, CRT overlay (responsive)
├── vite.config.js          # Vite build config (dist/, base ./)
├── public/assets/          # Static assets served at assets/...
│   ├── manifest.json
│   └── images/             # SVG sprite sheets (classic mode)
├── src/
│   ├── boot.js             # Mode select, lazy-loads a mode
│   ├── main.js             # CLASSIC mode: loop, input, rendering
│   ├── entities/           # Car, Obstacle, Pickup (classic)
│   ├── levelManager.js     # Shared phases/difficulty (.cjs copy for tests)
│   ├── SoundManager.js     # Web Audio SFX and engine
│   ├── audio/              # FM music sequencer + tracks
│   ├── outrun/             # OUTRUN mode (road, track, world, renderer, HUD, screens)
│   └── *.cjs               # Legacy testable units (collision, spawner, score, ...)
├── tests/                  # Unit tests (test_*.js CommonJS, test_*.mjs ESM)
├── specs/                  # Feature specifications
├── scripts/verify-ui.js    # Visual smoke test (Playwright)
├── .claude/skills/         # Claude Code skills (verify-ui)
├── AGENTS.md               # Instructions for AI coding agents
└── .github/workflows/deploy.yml  # CI/CD pipeline
```

### Asset Management

#### Asset Directory Structure

Classic mode sprites live in `public/assets/` (served at `assets/...`). OutRun mode textures are procedural (`src/outrun/sprites.js`).

```
public/assets/
├── manifest.json          # Asset registry with metadata
└── images/
    ├── car-sprite.svg            # Player car sprite sheet (192x128, 3 frames)
    ├── obstacle-sprite.svg       # Obstacle car sprite sheet (192x128, 3 frames)
    ├── car.svg                   # Player car static fallback (64x128)
    └── obstacle.svg              # Obstacle car static fallback (64x128)
```

#### Asset Conventions

**Sprite Sheets:**
- Format: SVG for resolution independence
- Size: 192x128 (64x128 per frame × 3 frames)
- Naming: `{entity}-sprite.svg`
- Frames: Horizontal layout, equal width

**Static Sprites:**
- Format: SVG
- Size: 64x128
- Naming: `{entity}.svg`
- Purpose: Fallback for sprite sheets

**Manifest Format:**

The `public/assets/manifest.json` file lists all game assets with metadata:

```json
{
  "version": "1.0.0",
  "assets": [
    {
      "name": "asset-id",
      "type": "image",
      "path": "assets/images/file.svg",
      "width": 64,
      "height": 128,
      "frames": 1,
      "description": "Asset description"
    }
  ]
}
```

#### Loading Assets

**Browser (main.js):**
```javascript
import AssetLoader from './assetLoader.js';

const loader = new AssetLoader({ pixelated: true });

// Load from manifest
await loader.loadManifest('assets/manifest.json');

// Load all with progress
await loader.loadAllWithProgress((progress) => {
  console.log(`Loading: ${progress.percentage}% (${progress.loaded}/${progress.total})`);
});

// Get asset
const carSprite = loader.get('car-sprite');
```

**Tests (Node.js):**

AssetLoader is tested in CommonJS format. See `tests/test_assets.js` for examples.

### Architecture

- **Boot:** `src/boot.js` shows the mode select and lazy-loads CLASSIC (`src/main.js`) or OUTRUN (`src/outrun/index.js`)
- **Game Loop:** Fixed timestep at 60 FPS using accumulator pattern (both modes)
- **CLASSIC:** Canvas 2D with `imageSmoothingEnabled: false`, ES6 entity classes with lane-based positioning
- **OUTRUN:** segment-based pseudo-3D road projected with PixiJS at 320x224, upscaled with pixelated CSS
- **Testing:** Unit tests for core logic (collision, spawning, scoring, levels, road projection, world rules, music data)
- **Module System:** ES modules (.js) in the browser; legacy CommonJS (.cjs) units and ESM `.mjs` tests in Node

Detailed architecture: [AGENTS.md](AGENTS.md) and [specs/outrun-mode-spec.md](specs/outrun-mode-spec.md).

## Manual Mobile Testing Checklist

Test on actual mobile device or Chrome DevTools device emulation:

**Movement Buttons:**
- [ ] On-screen arrows appear on narrow viewport (< 768px width)
- [ ] Left button moves car to left lane
- [ ] Right button moves car to right lane
- [ ] Buttons don't appear on desktop (> 768px width)
- [ ] Buttons are large enough to tap comfortably (60x60px)

**Swipe Detection:**
- [ ] Swipe left triggers moveLeft()
- [ ] Swipe right triggers moveRight()
- [ ] Short swipes (< 50px) don't trigger movement
- [ ] Swiping works during gameplay (not paused)

**Buttons and Menus:**
- [ ] CLASSIC sound/pause buttons work (bottom center)
- [ ] OUTRUN pause button works (top-left) and does not cover the car
- [ ] Pause and game over options respond to taps in both modes

**Responsiveness:**
- [ ] Cabinet fits without scrolling in portrait (slim) and landscape (bezel only)
- [ ] Game scales properly on small screens and taps hit the right targets
- [ ] Touch buttons positioned correctly at different screen sizes

## Deployment

The game automatically deploys to GitHub Pages when changes are pushed to the `main` branch:

1. GitHub Actions workflow (Node 22) runs ESLint and tests
2. Vite builds the game into `dist/`
3. `dist/` is deployed to GitHub Pages
4. Site is live at https://dwildt.github.io/enduro

### Deployment Status

Check the [Actions tab](https://github.com/dwildt/enduro/actions) for deployment status and logs.

## Contributing

1. Ensure tests and linter pass before committing: `npm run lint && npm test`
2. Follow the trunk-based development workflow (work on `main`)
3. All `git push` operations must be done manually by the repository owner
4. AI-assisted development: see [AGENTS.md](AGENTS.md) (used by Claude Code via CLAUDE.md and by GitHub Copilot)

## License

This project is part of a 100 Days of Code challenge.

---

Inspired by the classic Atari Enduro and Sega's OutRun. Built with vanilla JavaScript and PixiJS.
