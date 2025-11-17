import { test, expect } from '@playwright/test';

test.describe('Dashboard UI', () => {
  // Run tests serially to avoid conflicts with user creation
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({ page, request }) => {
    // Create test user first with unique identifier
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const email = `test-${uniqueId}@example.com`;
    const password = 'password123';
    const username = `testuser-${uniqueId}`;

    // Register user via API
    const registerResponse = await request.post('http://localhost:3000/api/v1/auth/register', {
      data: {
        email,
        password,
        username,
      },
    });

    // If registration fails due to duplicate, try to login instead
    if (!registerResponse.ok() && registerResponse.status() === 409) {
      // User already exists, try to login
      const loginResponse = await request.post('http://localhost:3000/api/v1/auth/login', {
        data: {
          email,
          password,
        },
      });
      expect(loginResponse.ok()).toBeTruthy();
    } else {
      if (!registerResponse.ok()) {
        const errorBody = await registerResponse.text();
        console.error('Register failed:', registerResponse.status(), errorBody);
      }
      expect(registerResponse.ok()).toBeTruthy();
    }

    // Navigate to login
    await page.goto('http://localhost:4200/auth/login');
    await page.waitForURL('**/auth/login', { waitUntil: 'domcontentloaded' });

    // Wait for form to be ready
    const emailInput = page.locator('#email, [formcontrolname="email"]');
    const passwordInput = page.locator('#password, [formcontrolname="password"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });

    // Fill login form
    await emailInput.fill(email);
    await passwordInput.fill(password);

    // Wait for button to be enabled
    const submitButton = page.getByRole('button', { name: /login/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });

    // Submit login form
    await submitButton.click();

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { waitUntil: 'domcontentloaded', timeout: 15000 });
  });

  test('should display dashboard page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should display header with navigation', async ({ page }) => {
    const header = page.locator('lib-header');
    await expect(header).toBeVisible();
    await expect(header.locator('.header__title')).toContainText('Athena');
  });

  test('should display sidebar with menu items', async ({ page }) => {
    // Wait for dashboard to fully load
    await page.waitForLoadState('load');

    // Ensure we're on the dashboard page
    await expect(page.locator('h1')).toContainText('Dashboard', { timeout: 10000 });

    const sidebar = page.locator('lib-sidebar');

    // Check if sidebar exists in DOM
    await expect(sidebar).toHaveCount(1, { timeout: 10000 });
    await expect(sidebar).toBeAttached({ timeout: 10000 });

    // Wait for Angular to render menu items
    await page.waitForSelector('.sidebar__nav', { timeout: 5000 });

    // Check for menu items in the sidebar - they should be in the DOM
    // Look for the sidebar navigation element
    const sidebarNav = sidebar.locator('.sidebar__nav');
    await expect(sidebarNav).toBeAttached({ timeout: 10000 });

    // Check for Dashboard menu item - it should exist in DOM
    // The label might be hidden if sidebar is collapsed, but it should still be in DOM
    const dashboardMenuItem = sidebar
      .locator('.sidebar__menu-item, .sidebar__menu-label')
      .filter({ hasText: /Dashboard/i });
    await expect(dashboardMenuItem.first()).toBeAttached({ timeout: 10000 });

    // Verify the text content exists (even if not visible)
    const menuText = await sidebar
      .locator('text=/Dashboard/i')
      .first()
      .textContent({ timeout: 5000 })
      .catch(() => null);
    expect(menuText).toBeTruthy();
  });

  test('should display dashboard cards', async ({ page }) => {
    const cards = page.locator('lib-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    // At least one card should be visible (Welcome card)
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should display statistics', async ({ page }) => {
    // Check for statistics card content
    await expect(page.locator('text=Statistics')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Total Users')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Active Sessions')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Pending Tasks')).toBeVisible({ timeout: 10000 });
  });

  test('should toggle sidebar collapse', async ({ page }) => {
    const sidebar = page.locator('lib-sidebar');
    const toggleButton = sidebar.locator('.sidebar__toggle');

    await expect(toggleButton).toBeVisible({ timeout: 10000 });

    // Check initial state by looking at the sidebar element's class
    // The class is on the <aside> element inside lib-sidebar
    const sidebarElement = sidebar.locator('aside.sidebar');
    await expect(sidebarElement).toBeAttached({ timeout: 10000 });

    const initialClass = await sidebarElement.getAttribute('class');
    const initiallyCollapsed = initialClass?.includes('sidebar--collapsed') || false;

    // Click the toggle button
    await toggleButton.click();

    // Wait for Angular change detection and state update
    await expect(sidebarElement).toHaveAttribute('class', /sidebar--collapsed/, {
      timeout: 5000,
    });

    // Check the new state
    const newClass = await sidebarElement.getAttribute('class');
    const nowCollapsed = newClass?.includes('sidebar--collapsed') || false;

    // The state should have changed
    expect(nowCollapsed).toBe(!initiallyCollapsed);
  });

  test('should navigate to dashboard from header menu', async ({ page }) => {
    const header = page.locator('lib-header');
    const dashboardLink = header.locator('a[href="/dashboard"]');

    await expect(dashboardLink).toBeVisible();
    await dashboardLink.click();

    await page.waitForURL('**/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show user menu in header', async ({ page }) => {
    const header = page.locator('lib-header');
    const userButton = header.locator('.header__user-button');

    await expect(userButton).toBeVisible();
    await userButton.click();

    // User menu should be visible
    const userMenu = header.locator('.header__user-menu');
    await expect(userMenu).toBeVisible();
    // Profile and Settings are commented out, only Logout should be visible
    await expect(userMenu.locator('text=Logout')).toBeVisible();
  });
});

// Separate test suite for unauthenticated access (no beforeEach)
test.describe('Dashboard UI - Unauthenticated', () => {
  test('should redirect to login when not authenticated', async ({ page, context }) => {
    // Clear authentication first
    await context.clearCookies();

    // Navigate to a page first to have access to localStorage
    await page.goto('http://localhost:4200');
    await page.waitForLoadState('domcontentloaded');

    // Now clear localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Try to access dashboard
    await page.goto('http://localhost:4200/dashboard');

    // Should redirect to login
    await page.waitForURL('**/auth/login**', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await expect(page.locator('h2')).toContainText('Login');
  });
});
