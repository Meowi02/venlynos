import { chromium } from '@playwright/test';

async function screenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000/calls');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'current-dashboard.png', fullPage: true });
  await browser.close();
  console.log('Screenshot saved as current-dashboard.png');
}

screenshot();