# Settings Screen — Specification

## Summary
Audio and display toggles today only work through keys (M music, E engine, C SFX, V CRT). OUTRUN on a phone has no way to change them, and CLASSIC on a phone only has two on-screen buttons. Add a **Settings** screen with large ON/OFF toggles, reachable from the pause menu of both modes and from the title screen. All audio defaults become **on** (music, engine and SFX).

## Decisions (validated with the owner)
- Entry: a **`⚙ SETTINGS` item in the pause menu** of both modes (works with keyboard, mouse and touch): `CONTINUE / RESTART / ⚙ SETTINGS / ABOUT / MENU`.
- Also on the **title screen**, next to ABOUT, so players can adjust before playing (e.g. mute the music before the OUTRUN radio select).
- CLASSIC keeps its quick on-screen buttons on phones; the `♪` button is renamed **`SFX`** (CLASSIC has no music). Buttons, keys and Settings all change the same saved preference.
- Same pattern as About: **one shared HTML overlay** (`#settings`), not drawn per canvas.

## Options per context
| Option | Key | localStorage | Default | Title | CLASSIC pause | OUTRUN pause |
|---|---|---|---|---|---|---|
| Music | M | `enduro_music_muted` | on | yes | — (no music) | yes |
| Engine sound | E | `enduro_engine_muted` | **on** (was off) | yes | yes | yes |
| Car sounds (SFX) | C | `enduro_sfx_muted` | on | yes | yes | yes |
| CRT scanlines | V | `enduro_crt` | on | yes | — | yes |

Players who already changed an option keep their saved choice; only players with nothing saved get the new defaults.

## Flow
- Each toggle switches immediately and is saved. In a mode, the change also applies to the running game (music gain, engine, CRT overlay). The engine stays silent while paused and starts on CONTINUE if it is on.
- Navigation: ↑↓ (W/S) move between toggles and BACK, Enter/Space/tap switches, Esc or BACK returns to the origin (title screen or the same pause menu). Keys do not reach the game while Settings is open (same capture as About).
- The title screen gets a row of two small buttons, `⚙ SETTINGS` and `ABOUT`, below the mode buttons (menu order: CLASSIC, OUTRUN, SETTINGS, ABOUT).

## Architecture
- `src/prefs.js` (pure, testable): keys, defaults and `getPref(name, storage)` / `setPref(name, on, storage)` for `music`, `engine`, `sfx`, `crt`. `SoundManager`, `MusicSequencer` and the OUTRUN CRT read their initial state through it, so the defaults live in one place.
- `src/settings.js`: `openSettings({ options, onChange, onClose })` fills the overlay with the given options, writes prefs and calls `onChange(name, on)` so the mode applies the change live. It shares the keyboard capture and focus handling with `about.js` (extract a small helper if it stays simple).
- `index.html` + `styles.css`: `#settings` overlay in the About card style, with large toggle rows (min 44px tall for touch).
- CLASSIC (`main.js`): pause option `⚙ SETTINGS` with `['engine', 'sfx']`; on-screen `♪` becomes `SFX`.
- OUTRUN (`outrun/index.js`, `screens.js`): pause option `⚙ SETTINGS` with all four options; the menu spacing is tightened so 5 items fit in 224px.
- `boot.js`: SETTINGS item with all four options (writes prefs only).

## Issues
- #54 — `src/prefs.js` and all-on audio defaults (do first).
- #53 — Settings screen (title and pause menus).
- #55 — CLASSIC on-screen `♪` button renamed `SFX`.

## Testing
- `tests/test_prefs.mjs`: defaults with empty storage (all on), saved values win, set/get round trip, corrupt values.
- `npm run verify:ui`: scenes `settings` (title), `classic-settings` and `outrun-settings` (pause), at 3 viewports; check that the 5-item pause menus fit.
- Manual: toggle in OUTRUN pause and check that the music and CRT change and the engine follows on CONTINUE; toggle from the title screen and start a mode.

## Future ideas
- Volume sliders instead of ON/OFF.
- Settings for the controls layout on phones (button size, left-handed).
