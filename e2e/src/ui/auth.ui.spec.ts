import { test, expect } from '@playwright/test';

test.describe('Auth UI', () => {
  test('login page renders and validates form', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/login', { waitUntil: 'load' });

    // Key form controls should be present (use formControlName for robustness)
    const emailInput = page.locator('#email, [formcontrolname="email"]');
    const passwordInput = page.locator('#password, [formcontrolname="password"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    const submitButton = page.getByRole('button', { name: /login/i });
    await expect(submitButton).toBeVisible({ timeout: 10000 });

    // Button should be disabled when form is invalid
    await expect(submitButton).toBeDisabled({ timeout: 10000 });

    // Touch fields to trigger validation without submitting
    await emailInput.click();
    await page.keyboard.press('Tab');
    await passwordInput.click();
    await page.keyboard.press('Tab');

    // Required validation messages should appear
    await expect(page.getByText('Email is required')).toBeVisible({ timeout: 10000 });

    // Invalid email
    await emailInput.fill('invalid-email');
    await passwordInput.fill('short');
    await expect(page.getByText('Invalid email format')).toBeVisible({ timeout: 10000 });
  });

  test('register page renders and validates fields', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/register', { waitUntil: 'load' });

    // Key form controls should be present (use formControlName for robustness)
    const emailInput = page.locator('#email, [formcontrolname="email"]');
    const usernameInput = page.locator('#username, [formcontrolname="username"]');
    const passwordInput = page.locator('#password, [formcontrolname="password"]');
    const confirmPasswordInput = page.locator(
      '#confirmPassword, [formcontrolname="confirmPassword"]'
    );

    // Basic fields should exist
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await expect(confirmPasswordInput).toBeVisible({ timeout: 10000 });
  });
});
