import { chromium } from 'playwright';

const URL = 'https://music.octavestreaming.com/';
const KEY = 'octave:pbtoken';

try {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  await page.waitForFunction(
    (key) => localStorage.getItem(key) !== null,
    KEY,
    { timeout: 30000 },
  );

  const value = await page.evaluate((key) => localStorage.getItem(key), KEY);

  let parsed = null;
  try {
    parsed = JSON.parse(value);
  } catch {
    // Not JSON — the raw value is the token itself.
  }
  const payload = {
    token: parsed?.token ?? value,
    exp: typeof parsed?.exp === "number" ? parsed.exp : null,
    skew: typeof parsed?.skew === "number" ? parsed.skew : null,
  };
  console.log(JSON.stringify(payload));

  await browser.close();
} catch (err) {
  console.error("Playwright browser unavailable:", err?.message || String(err));
  process.exit(1);
}