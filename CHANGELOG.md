# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/). The release process is described in the README ("Releases").

## [Unreleased]

### Added
- About screen from the title screen and the pause menu of both modes: version, author (GitHub, LinkedIn, YouTube), star the source code and GitHub Sponsors links (#51).
- Controls legend on the cabinet control panel (notebook/desktop), per mode (#52).

## [1.0.0] - 2026-09-30

First tagged release: both game modes inside the arcade cabinet.

### Added
- CLASSIC mode: 2D top-down lane racer on Canvas 2D with 3 lanes, 3 lives, hit invulnerability and time-based score (#3, #4, #8, #9, #11, #12, #13).
- 4 phases (Country Roads, Mountain Pass, Desert Highway, Night City Sprint) with per-phase speed, spawn rate, gap and palette (#14, #23, #33).
- Power-ups: shield and score boost; the boost also speeds up the car (#27, #45).
- 64x128 SVG sprite sheets with wheel animation and 5 car colors selectable before the race (#20, #35).
- Mobile controls: on-screen buttons and swipe gestures (#21).
- Asset pipeline with manifest and fallback (#29).
- OUTRUN mode: pseudo-3D rear-view racer on PixiJS with curves, hills, 4 themed stages, HUD, CRT scanlines and car/radio/pause/game over screens (#36, #37, #38, #39).
- Radio select with 7 stations of procedural FM chiptune music: original compositions and public-domain arrangements (#38, #49).
- Procedural Web Audio SFX and engine sound with persisted M/E/C toggles; pause and game over menus in both modes (#19, #43).
- Arcade cabinet around the screen, responsive for notebook and phone, with cover-art title screen and woodgrain cabinet (#44, #50).
- Local top 5 ranking in both modes (#26).
- Traffic that signals and changes lanes in later phases, in both modes (#22).
- Visual smoke test `npm run verify:ui` (local only) and the `verify-ui` agent skill (#48).
- Deploy to GitHub Pages on every push to `main` (#1, #6, #17).

### Changed
- Controls standardized across modes (#40); clearer highlight on the mode select (#41).
- Lower spawn rates and speed-based obstacle colors (#34).
- ESLint 9 with flat config (#47); agent instructions centralized in AGENTS.md (#46).

[Unreleased]: https://github.com/dwildt/enduro/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/dwildt/enduro/releases/tag/v1.0.0
