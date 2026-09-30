# Enduro - 8-bit Obstacle Racing

![Deploy Status](https://github.com/dwildt/enduro/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)

**[▶️ Play Now](https://dwildt.github.io/enduro)**

## About

Enduro is a browser-based obstacle racing game inspired by the classic Atari Enduro. Built with vanilla JavaScript and HTML5 Canvas, it features an 8-bit pixel-art aesthetic and progressive difficulty across four themed phases.

- **Zero dependencies** - Plain ES modules, no frameworks
- **Retro aesthetic** - 8-bit pixel-art visuals with pixelated rendering
- **Cross-platform** - Responsive controls for desktop and mobile
- **CI/CD** - Automated testing and deployment via GitHub Actions

## Features

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
| **Space** or **P** | Pause/unpause game |
| **C** | Restart (opens car color selection) |
| **Enter** | Retry after game over |
| **M** | Toggle sound effects |
| **E** | Toggle engine sound |
| **R** | Toggle radio/music (OutRun mode) |
| **V** | Toggle CRT scanlines (OutRun mode) |
| **Esc** | Back to mode select (OutRun mode) |
| **Mouse Click** | Click left/right side to switch lanes |

### Mobile / Touch Devices
| Input | Action |
|-------|--------|
| **On-screen buttons** | Tap left/right arrows at bottom corners |
| **Swipe left/right** | Swipe horizontally to change lanes |
| **Tap left/right side** | Tap screen halves to change lanes |
| **Audio buttons** | Tap [M] and [E] in upper right for sound controls |

**Note:** On-screen movement buttons appear automatically on narrow viewports (phones/tablets under 768px width).

## Power-ups

Collect power-ups to gain temporary advantages:

- 🛡️ **Shield (Blue)** - 5 seconds of invulnerability
- ⚡ **Boost (Orange)** - 8 seconds of 2x score multiplier

Power-ups spawn every 10 seconds in random lanes. The HUD shows the active power-up and remaining time.

## Gameplay

Navigate through traffic by switching between three lanes. Avoid obstacles to survive and progress through four increasingly challenging phases:

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

- Node.js (for running tests and ESLint)
- Modern browser with ES module support

### Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm start
# Game will be available at http://localhost:3000

# Run tests
npm test

# Run linter
npm run lint

# Pre-commit check (recommended)
npm run lint && npm test
```

### Project Structure

```
enduro/
├── index.html              # Game entry point
├── styles.css              # Pixelated rendering styles
├── src/
│   ├── main.js            # Game loop and core logic
│   ├── entities/
│   │   ├── Car.js         # Player car class
│   │   └── Obstacle.js    # Obstacle car class
│   ├── levelManager.js    # Phase progression system
│   ├── collision.cjs      # Collision detection
│   ├── spawner.cjs        # Obstacle spawning logic
│   └── ...                # Additional game modules
├── assets/
│   └── images/            # SVG sprite assets
├── tests/                 # Unit tests
└── .github/
    └── workflows/
        └── deploy.yml     # CI/CD pipeline
```

### Asset Management

#### Asset Directory Structure

```
assets/
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

The `assets/manifest.json` file lists all game assets with metadata:

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

- **Game Loop:** Fixed timestep at 60 FPS using accumulator pattern
- **Entities:** ES6 classes for Car and Obstacle with lane-based positioning
- **Rendering:** HTML5 Canvas with `imageSmoothingEnabled: false` for pixel-art
- **Testing:** Unit tests for core logic (collision, spawning, scoring)
- **Module System:** ES modules (.js) for browser, CommonJS (.cjs) for Node tests

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

**Fallback Tap Zones:**
- [ ] Tapping left screen half moves left
- [ ] Tapping right screen half moves right
- [ ] Audio buttons still work (upper right corner)

**Responsiveness:**
- [ ] Game scales properly on small screens
- [ ] No horizontal scrolling
- [ ] Touch buttons positioned correctly at different screen sizes

## Deployment

The game automatically deploys to GitHub Pages when changes are pushed to the `main` branch:

1. GitHub Actions workflow runs ESLint and tests
2. Static files are bundled into an artifact
3. Artifact is deployed to GitHub Pages
4. Site is live at https://dwildt.github.io/enduro

### Deployment Status

Check the [Actions tab](https://github.com/dwildt/enduro/actions) for deployment status and logs.

## Contributing

1. Ensure tests and linter pass before committing: `npm run lint && npm test`
2. Follow the trunk-based development workflow (work on `main`)
3. All `git push` operations must be done manually by the repository owner
4. See [CLAUDE.md](CLAUDE.md) for AI-assisted development guidelines

## License

This project is part of a 100 Days of Code challenge.

---

Inspired by the classic Atari Enduro. Built with vanilla JavaScript.
