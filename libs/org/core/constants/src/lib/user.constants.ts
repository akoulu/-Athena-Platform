export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
} as const;

export const USER_PERMISSIONS = {
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  ADMIN_READ: 'admin:read',
  ADMIN_WRITE: 'admin:write',
  ADMIN_DELETE: 'admin:delete',
  DEMOGRAPHICS_READ: 'demographics:read',
  DEMOGRAPHICS_WRITE: 'demographics:write',
  DEMOGRAPHICS_DELETE: 'demographics:delete',
  WELFARE_READ: 'welfare:read',
  WELFARE_WRITE: 'welfare:write',
  WELFARE_DELETE: 'welfare:delete',
  MIGRATION_READ: 'migration:read',
  MIGRATION_WRITE: 'migration:write',
  MIGRATION_DELETE: 'migration:delete',
} as const;

export const USER_DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
