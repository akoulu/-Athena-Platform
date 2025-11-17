import { test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Auth UI debug', () => {
  test('dump login DOM and screenshot', async ({ page }, testInfo) => {
    await page.goto('http://localhost:4200/auth/login', { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    console.log('--- LOGIN_DOM_START ---');
    console.log(html.substring(0, 10000));
    console.log('--- LOGIN_DOM_END ---');
    await testInfo.attach('login.html', { body: Buffer.from(html), contentType: 'text/html' });
    const shot = await page.screenshot();
    await testInfo.attach('login.png', { body: shot, contentType: 'image/png' });
  });

  test('dump register DOM and screenshot', async ({ page }, testInfo) => {
    await page.goto('http://localhost:4200/auth/register', { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    console.log('--- REGISTER_DOM_START ---');
    console.log(html.substring(0, 10000));
    console.log('--- REGISTER_DOM_END ---');
    await testInfo.attach('register.html', { body: Buffer.from(html), contentType: 'text/html' });
    const shot = await page.screenshot();
    await testInfo.attach('register.png', { body: shot, contentType: 'image/png' });
  });
});
