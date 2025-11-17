import { test, expect } from '@playwright/test';

/**
 * Backend API E2E Tests
 * Tests the NestJS API endpoints
 *
 * Note: The NestJS app has a global prefix of 'api', so endpoints are at /api/*
 *
 * To run only API tests:
 * npx playwright test --project=api
 */
test.describe('API Endpoints', () => {
  test('GET /api should return success', async ({ request }) => {
    const response = await request.get('/api');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    // Verify response is JSON
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('API should return JSON content type', async ({ request }) => {
    const response = await request.get('/api');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('API should handle 404 for unknown routes', async ({ request }) => {
    const response = await request.get('/api/unknown-route');
    expect(response.status()).toBe(404);
  });
});
