// Cross-browser smoke test of the core flows for issues #14/#15.
// Runs the same scenario in Firefox and Chromium (Chromium covers Chrome + Edge,
// which share its engine) against the running dev stack (Angular :4200, API :8765).
//
// Usage: node e2e/cross-browser.mjs
import { firefox, chromium } from 'playwright';

const BASE = 'http://localhost:4200';
const results = [];

async function run(name, launcher) {
  const browser = await launcher.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const checks = [];
  const check = (label, ok) => checks.push({ label, ok });

  try {
    // 1. List loads with at least one recipe card
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 5000 });
    check('list renders cards', (await page.locator('.card').count()) > 0);

    // 2. Search filters server-side (wait for the filtered state, not a fixed delay)
    await page.fill('input[type=search]', 'choc');
    await page
      .waitForFunction(() => {
        const titles = [...document.querySelectorAll('.card-title')].map((e) => e.textContent || '');
        return titles.length > 0 && titles.every((t) => /choc/i.test(t));
      }, { timeout: 5000 })
      .then(() => check('search filters to chocolate', true))
      .catch(() => check('search filters to chocolate', false));
    await page.fill('input[type=search]', '');
    await page.waitForFunction(() => document.querySelectorAll('.card').length >= 1, { timeout: 5000 });

    // 3. Hover preview popover appears
    await page.locator('.card-title a').first().hover();
    await page.waitForSelector('.recipe-preview', { timeout: 5000 });
    check('hover preview shows', await page.locator('.recipe-preview').isVisible());
    await page.mouse.move(0, 0);

    // 4. Sort (Title A–Z) re-orders the list
    await page.selectOption('select[aria-label="Sort recipes"]', 'title-ASC');
    await page.waitForTimeout(500);
    const sorted = await page.locator('.card-title').allInnerTexts();
    const isSorted = sorted.every((t, i) => i === 0 || sorted[i - 1].localeCompare(t) <= 0);
    check('sort title A–Z orders the list', sorted.length > 1 ? isSorted : true);

    // 5. Detail view
    await page.locator('.card-title a').first().click();
    await page.waitForSelector('article h1', { timeout: 5000 });
    check('detail view renders', (await page.locator('article .list-group-item').count()) > 0);

    // 6. Share-by-e-mail modal
    await page.click('button:has-text("Share by e-mail")');
    await page.waitForSelector('.modal.show', { timeout: 5000 });
    await page.fill('#mailTo', `friend-${name}@example.com`);
    await page.click('.modal-footer button:has-text("Send")');
    await page.waitForSelector('.alert-success', { timeout: 5000 });
    check('e-mail send shows success', await page.locator('.alert-success').isVisible());

    // 7. Create flow
    await page.goto(`${BASE}/recipes/new`, { waitUntil: 'networkidle' });
    const unique = `XBrowser-${name}-${Math.floor(performance.now())}`;
    await page.fill('#title', unique);
    await page.fill('input[placeholder=Name]', 'flour');
    await page.fill('input[placeholder=Amount]', '200');
    await page.fill('input[placeholder=Unit]', 'g');
    await page.click('button[type=submit]');
    await page.waitForURL(`${BASE}/`, { timeout: 5000 });
    await page.waitForSelector('.card', { timeout: 5000 });
    const created = (await page.locator('.card-title').allInnerTexts()).some((t) => t.includes(unique));
    check('create recipe appears in list', created);

    check('no console errors', errors.length === 0);
  } catch (err) {
    check(`exception: ${err.message}`, false);
  } finally {
    await browser.close();
  }

  const passed = checks.every((c) => c.ok);
  results.push({ name, passed, checks });
  console.log(`\n=== ${name} ===`);
  checks.forEach((c) => console.log(`  ${c.ok ? '✓' : '✗'} ${c.label}`));
}

await run('firefox', firefox);
await run('chromium', chromium);

console.log('\n=== SUMMARY ===');
let allOk = true;
for (const r of results) {
  console.log(`  ${r.passed ? 'PASS' : 'FAIL'}  ${r.name}`);
  if (!r.passed) allOk = false;
}
process.exit(allOk ? 0 : 1);
