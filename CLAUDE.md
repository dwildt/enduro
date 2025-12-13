# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enduro is a vanilla JavaScript browser game inspired by Atari Enduro. It's a 2D top-down obstacle racing game with an 8-bit pixel-art aesthetic, built with no framework dependencies using plain ES modules and HTML5 Canvas.

## Development Commands

### Core Commands
```bash
npm install            # Install dependencies (ESLint)
npm run lint           # Run ESLint on src/ and tests/
npm test               # Run unit tests via Node.js test runner
npm start              # Start local preview server (npx serve .)
```

### Pre-commit Workflow
Always run before committing:
```bash
npm run lint && npm test
```

### Single Test Execution
To run a specific test file:
```bash
node tests/test_<name>.js
```

## Code Architecture

### Module System Split
The codebase uses a dual-module approach:
- **ES modules (.js)**: Browser runtime code (main.js, Car.js, Obstacle.js, levelManager.js)
- **CommonJS (.cjs)**: Testable logic units for Node.js (collision.cjs, spawner.cjs, score.cjs, etc.)

This split allows core game logic to be unit tested in Node.js while keeping browser code in ES modules.

### Core Game Structure

**Game Loop (main.js)**
- Fixed timestep loop at 60 FPS (16.67ms ticks)
- Uses accumulator pattern for deterministic updates
- Separated update() and render() with interpolation support
- Update logic runs in fixed steps; render uses interpolation for smooth visuals

**Entity System**
- `Car.js`: Player car with lane-based movement and smooth interpolation (300 px/s)
- `Obstacle.js`: Enemy cars with configurable speed and lane assignment
- Both entities use lane positions computed dynamically from canvas width

**Game State (main.js:103-164)**
- Lives system with invulnerability timer (1.5s after hit)
- Score increases continuously (10 points/second)
- Obstacles spawn based on phase difficulty (spawnRate per second)
- Collision detection uses AABB (axis-aligned bounding box)

**Phase/Level System (LevelManager.js)**
- 4 progressive phases with increasing difficulty:
  1. Country Roads (60s, speed 1.0x, spawn 0.6/s)
  2. Mountain Pass (90s, speed 1.3x, spawn 0.9/s)
  3. Desert Highway (120s, speed 1.6x, spawn 1.4/s)
  4. Night City Sprint (infinite, speed 2.0x, spawn 2.2/s)
- Phase transitions trigger visual overlays (2s display)
- Each phase has unique color palette for road/margins/dividers

**Rendering Pipeline (main.js:166-273)**
- Phase-specific background colors (margin, road, divider)
- Road width: canvas.width - 128 (64px margins on each side)
- Lane positions: computed at 1/6, 3/6, 5/6 of road width
- HUD shows score (top-left) and lives (top-right)
- Overlays: pause, game over, phase transitions, flash effects

**Input Handling (main.js:68-97)**
- Keyboard: Arrow keys or A/D for lane switching, Space/P for pause, R for restart
- Mouse: Click left/right half of canvas to move lanes
- Touch: Tap zones for mobile (same as mouse)
- Input ignored when paused or game over

**Obstacle Spawning (main.js:116-133)**
- Probabilistic spawn each frame: `Math.random() < spawnRate * dt`
- Random lane selection with minimum gap enforcement (100px)
- Speed varies: baseSpeed * 80 + random(0-60) pixels/second
- Spawns at y=-60 (offscreen top), removed when y > canvas.height

## Code Patterns and Conventions

### Coordinate System
- Origin (0,0) at top-left
- Y-axis increases downward
- Player car fixed at y=540
- Obstacles spawn at y=-60 and move downward

### Lane System
- 3 lanes centered at 1/6, 3/6, 5/6 of road width
- Lane positions computed dynamically: `computeLanePositions()` in main.js:11-16
- Entities store lane index and target position, interpolate smoothly

### Collision Detection
- AABB collision: `aabbOverlap()` at main.js:99-101
- Player hitbox: 32x48 centered at car.x, car.y
- Obstacle hitbox: 32x48 centered at obstacle.x, obstacle.y
- Collision only checked when not invulnerable

### Asset Loading
- SVG images loaded asynchronously (car.svg, obstacle.svg from assets/images/)
- Fallback colored rectangles render until images load
- Canvas uses `imageSmoothingEnabled = false` for pixel-art rendering

### Testing Strategy
- Unit tests are CommonJS modules in tests/
- Test runner (run-tests.js) requires all test_*.js files
- Tests validate deterministic logic (collision, scoring, spawning, level transitions)
- Browser-specific code (rendering, input) is not unit tested

### ESLint Configuration
- `eslint:recommended` with custom rules
- Enforces semicolons and single quotes
- Allows unused args and underscore-prefixed vars
- Configured for both browser and Node environments

## GitHub Actions CI/CD

**Deploy Workflow (.github/workflows/deploy.yml)**
- Triggers on push to main
- Runs lint and tests before deployment
- Copies static files (index.html, styles.css, assets/, src/) to docs/
- Deploys docs/ to GitHub Pages using upload-pages-artifact@v3 and deploy-pages@v3
- Requires Pages enabled with Actions deployment method

## Development Notes

### Git Workflow and Push Policy

**CRITICAL: All `git push` operations must be performed manually by the repository owner.**

- Claude Code may create commits with `git commit` after making changes
- Claude Code must NEVER execute `git push` commands
- After commits are created, the repository owner will manually review and push
- This ensures the owner maintains full control over what gets published to GitHub

### Trunk-Based Development
Work directly on main branch per project policy. No feature branches required.

### Avoiding Over-Engineering
Keep changes minimal and focused. Don't add features, refactoring, or improvements beyond what's requested. No premature abstractions.

### Phase Color Palettes (main.js:169-175)
Each phase has margin/road/divider colors. Modify phaseColors object to adjust visual themes.

### Spawner Gap Logic (main.js:124-132)
Prevents obstacles from spawning too close together in same lane (100px minimum gap). Adjust minGap to change spacing.
