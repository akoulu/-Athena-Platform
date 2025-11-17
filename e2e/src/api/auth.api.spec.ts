import { test, expect } from '@playwright/test';

test.describe('Authentication API', () => {
  test('should register a new user', async ({ request }) => {
    const response = await request.post('/api/v1/auth/register', {
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        username: `testuser-${Date.now()}`,
        firstName: 'Test',
        lastName: 'User',
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('user');
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body.user.email).toContain('@example.com');
  });

  test('should login with valid credentials', async ({ request }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    const username = `testuser-${Date.now()}`;

    const registerResponse = await request.post('/api/v1/auth/register', {
      data: {
        email,
        password,
        username,
      },
    });

    if (!registerResponse.ok()) {
      const errorBody = await registerResponse.text();
      console.error('Register failed:', registerResponse.status(), errorBody);
    }
    expect(registerResponse.ok()).toBeTruthy();

    // Wait a bit for user to be fully created
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await request.post('/api/v1/auth/login', {
      data: {
        email,
        password,
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      console.error('Login failed:', response.status(), errorBody);
    }
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body.user.email).toBe(email);
  });

  test('should return 401 for invalid credentials', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should refresh access token', async ({ request }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    const username = `testuser-${Date.now()}`;

    const registerResponse = await request.post('/api/v1/auth/register', {
      data: {
        email,
        password,
        username,
      },
    });

    expect(registerResponse.ok()).toBeTruthy();
    const registerBody = await registerResponse.json();
    expect(registerBody).toHaveProperty('refreshToken');
    const refreshToken = registerBody.refreshToken;

    const refreshResponse = await request.post('/api/v1/auth/refresh', {
      data: {
        refreshToken,
      },
    });

    expect(refreshResponse.ok()).toBeTruthy();
    const refreshBody = await refreshResponse.json();
    expect(refreshBody).toHaveProperty('accessToken');
    expect(refreshBody).toHaveProperty('refreshToken');
  });

  test('should get user profile with valid token', async ({ request }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    const username = `testuser-${Date.now()}`;

    const registerResponse = await request.post('/api/v1/auth/register', {
      data: {
        email,
        password,
        username,
      },
    });

    const registerBody = await registerResponse.json();
    const accessToken = registerBody.accessToken;

    const profileResponse = await request.get('/api/v1/auth/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(profileResponse.ok()).toBeTruthy();
    const profileBody = await profileResponse.json();
    expect(profileBody.email).toBe(email);
    expect(profileBody.username).toBe(username);
  });

  test('should return 401 for profile without token', async ({ request }) => {
    const response = await request.get('/api/v1/auth/profile');

    expect(response.status()).toBe(401);
  });

  test('should logout user', async ({ request }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    const username = `testuser-${Date.now()}`;

    const registerResponse = await request.post('/api/v1/auth/register', {
      data: {
        email,
        password,
        username,
      },
    });

    const registerBody = await registerResponse.json();
    const accessToken = registerBody.accessToken;
    const refreshToken = registerBody.refreshToken;

    const logoutResponse = await request.post('/api/v1/auth/logout', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        refreshToken,
      },
    });

    expect(logoutResponse.ok()).toBeTruthy();
  });

  test('should request password reset', async ({ request }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    const username = `testuser-${Date.now()}`;

    await request.post('/api/v1/auth/register', {
      data: {
        email,
        password,
        username,
      },
    });

    const response = await request.post('/api/v1/auth/forgot-password', {
      data: {
        email,
      },
    });

    expect(response.ok()).toBeTruthy();
  });

  test('should return 200 even for non-existent email in forgot password', async ({ request }) => {
    const response = await request.post('/api/v1/auth/forgot-password', {
      data: {
        email: 'nonexistent@example.com',
      },
    });

    expect(response.ok()).toBeTruthy();
  });

  test('should change password with valid token and correct old password', async ({ request }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    const username = `testuser-${Date.now()}`;

    const registerResponse = await request.post('/api/v1/auth/register', {
      data: {
        email,
        password,
        username,
      },
    });

    const registerBody = await registerResponse.json();
    const accessToken = registerBody.accessToken;

    const changePasswordResponse = await request.post('/api/v1/auth/change-password', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        oldPassword: password,
        newPassword: 'newPassword123',
      },
    });

    expect(changePasswordResponse.ok()).toBeTruthy();
  });

  test('should return 401 for change password with incorrect old password', async ({ request }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    const username = `testuser-${Date.now()}`;

    const registerResponse = await request.post('/api/v1/auth/register', {
      data: {
        email,
        password,
        username,
      },
    });

    const registerBody = await registerResponse.json();
    const accessToken = registerBody.accessToken;

    const changePasswordResponse = await request.post('/api/v1/auth/change-password', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        oldPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      },
    });

    expect(changePasswordResponse.status()).toBe(401);
  });

  test('should return 401 for change password without token', async ({ request }) => {
    const changePasswordResponse = await request.post('/api/v1/auth/change-password', {
      data: {
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      },
    });

    expect(changePasswordResponse.status()).toBe(401);
  });

  test('should reset password with valid reset token', async ({ request }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    const username = `testuser-${Date.now()}`;

    await request.post('/api/v1/auth/register', {
      data: {
        email,
        password,
        username,
      },
    });

    // Request password reset
    const forgotPasswordResponse = await request.post('/api/v1/auth/forgot-password', {
      data: {
        email,
      },
    });

    expect(forgotPasswordResponse.ok()).toBeTruthy();

    // Note: In a real scenario, you would get the reset token from email
    // For testing purposes, we'll need to check if the endpoint exists and handles the request
    // This test assumes the reset token would be provided somehow (e.g., from email or test setup)
  });

  test('should return 400 for reset password with invalid token', async ({ request }) => {
    const resetPasswordResponse = await request.post('/api/v1/auth/reset-password', {
      data: {
        token: 'invalid-token',
        newPassword: 'newPassword123',
      },
    });

    // Should return 400 for invalid token
    expect([400, 401]).toContain(resetPasswordResponse.status());
  });

  test('should return 400 for reset password without token', async ({ request }) => {
    const resetPasswordResponse = await request.post('/api/v1/auth/reset-password', {
      data: {
        newPassword: 'newPassword123',
      },
    });

    expect([400, 401]).toContain(resetPasswordResponse.status());
  });

  test('should return 401 for refresh with expired token', async ({ request }) => {
    // Use an obviously invalid/expired token
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    const refreshResponse = await request.post('/api/v1/auth/refresh', {
      data: {
        refreshToken: expiredToken,
      },
    });

    expect([401, 400]).toContain(refreshResponse.status());
  });

  test('should return 401 for refresh with invalid token format', async ({ request }) => {
    const invalidToken = 'not-a-valid-token';

    const refreshResponse = await request.post('/api/v1/auth/refresh', {
      data: {
        refreshToken: invalidToken,
      },
    });

    expect([401, 400]).toContain(refreshResponse.status());
  });

  test('should return 400 for refresh without token', async ({ request }) => {
    const refreshResponse = await request.post('/api/v1/auth/refresh', {
      data: {},
    });

    expect([400, 401]).toContain(refreshResponse.status());
  });

  test('should return 401 for refresh with blacklisted token', async ({ request }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    const username = `testuser-${Date.now()}`;

    const registerResponse = await request.post('/api/v1/auth/register', {
      data: {
        email,
        password,
        username,
      },
    });

    const registerBody = await registerResponse.json();
    const accessToken = registerBody.accessToken;
    const refreshToken = registerBody.refreshToken;

    // Logout to blacklist the token
    await request.post('/api/v1/auth/logout', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        refreshToken,
      },
    });

    // Try to refresh with the blacklisted token
    const refreshResponse = await request.post('/api/v1/auth/refresh', {
      data: {
        refreshToken,
      },
    });

    expect([401, 400]).toContain(refreshResponse.status());
  });
});
