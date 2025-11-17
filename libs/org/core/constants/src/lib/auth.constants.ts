export const AUTH_CONSTANTS = {
  JWT_SECRET: process.env['JWT_SECRET'] || 'your-secret-key',
  JWT_EXPIRES_IN: String(process.env['JWT_EXPIRES_IN'] || '15m'),
  REFRESH_TOKEN_EXPIRES_IN: String(process.env['REFRESH_TOKEN_EXPIRES_IN'] || '7d'),
  BCRYPT_ROUNDS: 10,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
} as const;

export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

export const AUTH_STRATEGIES = {
  JWT: 'jwt',
  LOCAL: 'local',
  REFRESH: 'jwt-refresh',
} as const;
