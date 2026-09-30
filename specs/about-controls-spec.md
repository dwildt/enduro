# About Screen and Controls Legend — Specification

## Summary
Two small cabinet features:
1. An **About** screen reachable from the title screen and from the pause menu of both modes. It shows the version, a short text about the author, a link to star the source code on GitHub and a link to GitHub Sponsors.
2. A **controls legend** printed on the cabinet control panel (desktop/notebook), like the instruction card on an arcade machine.

## Decisions (validated with the owner)
- About is **one shared HTML overlay** (`#about` inside `.screen`), not drawn per canvas. Links are real `<a>` elements, the style matches the title screen, and the same code serves all three entry points.
- The version comes from **`package.json` at build time**: Vite `define` injects `__APP_VERSION__`. The release checklist already bumps `package.json`, so the About screen always matches the latest tag (`v1.0.0` today).
- The controls legend goes on the **cabinet control panel**, which is decorative today and only shown on notebook/desktop. Phones keep the on-screen touch buttons as their hint.
- The legend changes **per mode** (`select` / `classic` / `outrun`) through the existing `#cabinet[data-mode]`, using CSS only. It does not change between race, menu and pause.

## About screen

### Content (English, like the rest of the UI)
- Title `ENDURO` + version `v1.0.0`, linked to the repository `https://github.com/dwildt/enduro`.
- One line about the game: browser racer inspired by Atari Enduro and Sega OutRun, built during #100DaysOfCode.
- Author: **Daniel Wildt**, Porto Alegre, Brazil. A short bio based on the GitHub profile (dev, entrepreneur, mentor, drummer, content creator), with links to the GitHub profile (`https://github.com/dwildt`), LinkedIn (`https://www.linkedin.com/in/danielwildt`) and YouTube (`https://youtube.com/danielwildt`). No link to the game page (the player is already on it).
- "Like it? Star the source code on GitHub": `https://github.com/dwildt/enduro`.
- "Support the author on GitHub Sponsors": `https://github.com/sponsors/dwildt`.
- Music note: original compositions and public-domain arrangements.
- `CLOSE` button.

### Entry points and flow
- Title screen: new `ABOUT` item below CLASSIC / OUTRUN (↑↓ + Enter, click or tap).
- Pause menu in both modes: `CONTINUE / RESTART / ABOUT / MENU`.
- Closing (Esc, Enter/Space on CLOSE, click or tap on CLOSE) returns to where the screen was opened: the title screen or the same pause menu, with the game still paused.
- While About is open, the keys do not reach the game or the title menu. Tab moves between the links.
- Links open in a new tab (`target="_blank" rel="noopener"`).

### Architecture
- `index.html`: hidden `#about` markup inside `.screen`.
- `src/version.js`: `export const VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';`.
- `vite.config.js`: `define: { __APP_VERSION__: JSON.stringify(pkg.version) }` (dev server and build).
- `src/about.js`: `openAbout({ onClose })`, `isAboutOpen()`. It fills in the version, shows the overlay, captures keys while open and calls `onClose` when it closes.
- `boot.js`, `main.js` (CLASSIC pause) and `outrun/index.js` + `outrun/screens.js` (OUTRUN pause) call `openAbout`.
- `styles.css`: overlay styles in the title-screen look. It must fit phone portrait, phone landscape and notebook, scrolling inside the overlay if needed but never the page.

## Controls legend

### Content per mode (keys from the AGENTS.md controls table)
| Mode | Joystick | Button A / B | Card |
|---|---|---|---|
| select | ↑↓ SELECT | ENTER START | — |
| classic | ← → LANE | P PAUSE / ENTER OK | E ENGINE · C SFX |
| outrun | ← → LANE | P PAUSE / ENTER OK | M MUSIC · E ENGINE · C SFX · V CRT · ESC EXIT |

### Architecture
- `index.html`: labels inside `.control-panel` (joystick, buttons and a legend card that replaces the "INSERT COIN" slot), with one block per mode.
- `styles.css`: `#cabinet[data-mode=...]` shows the matching block. The panel stays hidden on phone portrait and on short screens (as today). Remove `aria-hidden` from the panel so the legend text is readable.

## Status
- About screen implemented (#51). The card is compacted to fit the 4:3 notebook screen without scrolling; the CLOSE button gets focus without scrolling the card.

## Testing
- Unit: `VERSION` fallback (`tests/test_version.mjs` or inside an existing test), if there is logic to test.
- `npm run verify:ui`: new scenes `about` (title → ABOUT), `classic-about` and `outrun-about` (pause → ABOUT). The existing notebook screenshots cover the legend for each mode.
- `npm run verify:ui -- --preview`: checks that the version is injected in the production build.

## Future ideas
- Show the legend contextually (race vs menu) if the modes report their state to the cabinet.
- Localized About text (PT-BR).
