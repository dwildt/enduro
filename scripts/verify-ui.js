// Visual smoke test: starts Vite, drives both game modes in a real browser at notebook
// and phone viewports, saves screenshots and fails on page/console errors.
//
// Usage: npm run verify:ui -- [--preview] [--url http://...] [--out dir]
//                             [--viewports notebook,phone-portrait] [--scenes menu,outrun]
//                             [--browser chrome|chromium]
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { build, createServer, preview } from 'vite';

const VIEWPORTS = {
  'notebook': { width: 1366, height: 657, mobile: false },
  'phone-portrait': { width: 390, height: 844, mobile: true },
  'phone-landscape': { width: 844, height: 390, mobile: true }
};

const startMode = async (page, mode) => {
  await page.click(`button[data-mode=${mode}]`);
  if(mode === 'outrun') await page.waitForSelector('#outrun-root canvas');
  await page.waitForTimeout(800);
};
const keys = async (page, list) => {
  for(const k of list){ await page.keyboard.press(k); await page.waitForTimeout(400); }
};

// each scene starts from a fresh page with a saved car color (skips the classic color screen)
const SCENES = {
  'menu': async () => {},
  'classic': async (page) => { await startMode(page, 'classic'); await page.waitForTimeout(1500); },
  'classic-pause': async (page) => { await startMode(page, 'classic'); await keys(page, ['p', 'ArrowDown']); },
  'outrun-select': async (page) => { await startMode(page, 'outrun'); await keys(page, ['Enter']); },
  'outrun': async (page) => { await startMode(page, 'outrun'); await keys(page, ['Enter', 'Enter']); await page.waitForTimeout(3000); },
  'outrun-pause': async (page) => { await startMode(page, 'outrun'); await keys(page, ['Enter', 'Enter', 'p', 'ArrowDown']); }
};

const { values: args } = parseArgs({
  options: {
    preview: { type: 'boolean', default: false },
    url: { type: 'string' },
    out: { type: 'string', default: '.verify-ui' },
    viewports: { type: 'string' },
    scenes: { type: 'string' },
    browser: { type: 'string', default: 'chrome' }
  }
});

const pick = (all, list) => {
  if(!list) return Object.keys(all);
  const names = list.split(',').map(s => s.trim());
  const unknown = names.filter(n => !all[n]);
  if(unknown.length) throw new Error(`Unknown: ${unknown.join(', ')} (available: ${Object.keys(all).join(', ')})`);
  return names;
};

async function startServer(){
  if(args.url) return { url: args.url, close: async () => {} };
  if(args.preview){
    await build({ logLevel: 'warn' });
    const server = await preview({ preview: { port: 4199 }, logLevel: 'warn' });
    return { url: server.resolvedUrls.local[0], close: () => server.close() };
  }
  const server = await createServer({ server: { port: 5199 }, logLevel: 'warn' });
  await server.listen();
  return { url: server.resolvedUrls.local[0], close: () => server.close() };
}

async function launch(){
  const options = { args: ['--autoplay-policy=no-user-gesture-required'] };
  try {
    return await chromium.launch(args.browser === 'chrome' ? { ...options, channel: 'chrome' } : options);
  } catch(err){
    throw new Error(`Could not launch ${args.browser}. Install Google Chrome, or run "npx playwright install chromium" and use --browser chromium.\n${err.message}`);
  }
}

const viewports = pick(VIEWPORTS, args.viewports);
const scenes = pick(SCENES, args.scenes);
const outDir = resolve(args.out);
await mkdir(outDir, { recursive: true });

const server = await startServer();
const browser = await launch();
const results = [];
try {
  // warm-up so Vite finishes dependency optimization before timing-sensitive scenes
  const warm = await browser.newPage();
  await warm.goto(server.url);
  await warm.click('button[data-mode=outrun]').catch(() => {});
  await warm.waitForSelector('#outrun-root canvas', { timeout: 30000 }).catch(() => {});
  await warm.close();

  for(const vp of viewports){
    const { width, height, mobile } = VIEWPORTS[vp];
    for(const scene of scenes){
      const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      page.on('console', m => { if(m.type() === 'error') errors.push(m.text()); });
      await page.goto(server.url);
      await page.evaluate(() => { localStorage.clear(); localStorage.setItem('enduro_car_color', 'red'); });
      await page.reload();
      await page.waitForSelector('#mode-select button');
      await page.waitForTimeout(400);
      try {
        await SCENES[scene](page);
      } catch(err){
        errors.push(`scene failed: ${err.message}`);
      }
      // layout sanity: the page must not scroll
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth || document.documentElement.scrollHeight > innerHeight);
      if(overflow) errors.push('page overflows the viewport (scrollbars)');
      const file = `${vp}--${scene}.png`;
      await page.screenshot({ path: resolve(outDir, file) });
      results.push({ viewport: vp, scene, file, errors });
      console.log(`${errors.length ? 'FAIL' : 'ok  '} ${vp} / ${scene}${errors.length ? ' -> ' + errors.join(' | ') : ''}`);
      await context.close();
    }
  }
} finally {
  await browser.close();
  await server.close();
}

await writeFile(resolve(outDir, 'report.json'), JSON.stringify({ url: server.url, results }, null, 2));
const failed = results.filter(r => r.errors.length);
console.log(`\n${results.length - failed.length}/${results.length} passed. Screenshots and report.json in ${outDir}`);
process.exit(failed.length ? 1 : 0);
