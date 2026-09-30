---
name: verify-ui
description: Visually verify the Enduro game in a real browser — both modes (CLASSIC, OUTRUN), mode select, race and pause menus — at notebook, phone portrait and phone landscape viewports, failing on console errors or page overflow. Use after any change to rendering, input, HUD/menus, styles.css/cabinet layout or boot flow, before committing UI work, when the user asks to "check", "validate" or "screenshot" the game, and with --preview before the owner pushes.
---

# verify-ui

Runs `scripts/verify-ui.js` (Playwright + Vite API), then inspects the screenshots. Unit tests don't cover rendering or layout; this does.

## Run

```bash
npm run verify:ui                                   # dev server, all viewports x all scenes (~80s)
npm run verify:ui -- --scenes outrun,outrun-pause   # subset of scenes
npm run verify:ui -- --viewports notebook           # subset of viewports
npm run verify:ui -- --preview                      # production build (vite build + preview)
npm run verify:ui -- --url http://localhost:5173/   # an already running server
npm run verify:ui -- --browser chromium             # bundled Chromium instead of system Chrome
```

- Viewports: `notebook` (1366x657), `phone-portrait` (390x844, touch), `phone-landscape` (844x390, touch).
- Scenes: `menu`, `classic`, `classic-pause`, `outrun-select` (radio screen), `outrun`, `outrun-pause`.
- Output: `.verify-ui/<viewport>--<scene>.png` + `report.json` (gitignored). Exit code 1 if any scene has page/console errors, a failed step, or scrollbars.
- If Chrome is missing: `npx playwright install chromium` and use `--browser chromium`.
- Choose the smallest subset that covers the change; run everything for layout/cabinet/boot changes and before a release.

## Inspect

A passing run only means "no errors". Open the relevant PNGs with the Read tool and check:

1. **Cabinet** — marquee/bezel/control panel match the viewport rules (full on notebook, slim without panel on phone portrait, bezel only on landscape); nothing cut off; theme matches the mode (neon sunset vs Atari woodgrain).
2. **Screen content** — the scene reached the expected state (race running, radio list, pause menu with RESTART highlighted, etc.); no blank/black canvas; sprites loaded (not fallback rectangles).
3. **HUD and menus** — text readable, not overlapping (banners over menus, touch buttons over the car); selected option clearly highlighted, others dimmed.
4. **Touch layouts** — on phone viewports the on-screen buttons are visible and inside the screen.
5. **The change itself** — whatever the current task modified is visible and correct.

## Report

Summarize pass/fail per viewport and scene, show which screenshots were inspected, and describe any visual problem with the file name. Don't claim a visual check passed without having opened the images. Fix problems before committing; rerun the affected scenes.

## Extending

Add a scene to `SCENES` in `scripts/verify-ui.js` when a new screen or flow appears (e.g. game over, new mode). Scenes start from a fresh page with `enduro_car_color=red` saved, so the classic color screen is skipped.
