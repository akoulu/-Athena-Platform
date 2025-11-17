import { UserEntity } from './user.entity';
import { Role } from '@org/types';

describe('UserEntity', () => {
  const mockRoles: Role[] = [
    { id: 'user', name: 'user', permissions: [] },
    { id: 'admin', name: 'admin', permissions: [] },
  ];

  describe('constructor', () => {
    it('should create entity with all provided properties', () => {
      const partial = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roles: mockRoles,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const entity = new UserEntity(partial);

      expect(entity.id).toBe('user-1');
      expect(entity.email).toBe('test@example.com');
      expect(entity.username).toBe('testuser');
      expect(entity.password).toBe('password123');
      expect(entity.firstName).toBe('Test');
      expect(entity.lastName).toBe('User');
      expect(entity.roles).toEqual(mockRoles);
      expect(entity.isActive).toBe(true);
      expect(entity.createdAt).toEqual(new Date('2024-01-01'));
      expect(entity.updatedAt).toEqual(new Date('2024-01-02'));
    });

    it('should generate id when not provided', () => {
      const partial = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const entity = new UserEntity(partial);

      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe('string');
      expect(entity.id).toMatch(/^\d+-[a-z0-9]+$/);
    });

    it('should set isActive to true by default', () => {
      const partial = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const entity = new UserEntity(partial);

      expect(entity.isActive).toBe(true);
    });

    it('should set isActive to false when explicitly provided', () => {
      const partial = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        isActive: false,
      };

      const entity = new UserEntity(partial);

      expect(entity.isActive).toBe(false);
    });

    it('should set empty array for roles when not provided', () => {
      const partial = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const entity = new UserEntity(partial);

      expect(entity.roles).toEqual([]);
    });

    it('should set current date for timestamps when not provided', () => {
      const before = new Date();
      const partial = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const entity = new UserEntity(partial);
      const after = new Date();

      expect(entity.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entity.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entity.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should handle optional properties', () => {
      const partial = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const entity = new UserEntity(partial);

      expect(entity.firstName).toBeUndefined();
      expect(entity.lastName).toBeUndefined();
    });
  });

  describe('generateId', () => {
    it('should generate unique ids', () => {
      const partial = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const entity1 = new UserEntity(partial);
      const entity2 = new UserEntity(partial);

      expect(entity1.id).not.toBe(entity2.id);
    });

    it('should generate id with timestamp and random string', () => {
      const partial = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const entity = new UserEntity(partial);
      const parts = entity.id.split('-');

      expect(parts.length).toBeGreaterThanOrEqual(2);
      expect(Number.parseInt(parts[0], 10)).toBeGreaterThan(0);
    });
  });

  describe('toJSON', () => {
    it('should exclude password and toJSON method from result', () => {
      const partial = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roles: mockRoles,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const entity = new UserEntity(partial);
      const json = entity.toJSON();

      expect(json).not.toHaveProperty('password');
      expect(json).not.toHaveProperty('toJSON');
      expect(json).toHaveProperty('id', 'user-1');
      expect(json).toHaveProperty('email', 'test@example.com');
      expect(json).toHaveProperty('username', 'testuser');
      expect(json).toHaveProperty('firstName', 'Test');
      expect(json).toHaveProperty('lastName', 'User');
      expect(json).toHaveProperty('roles', mockRoles);
      expect(json).toHaveProperty('isActive', true);
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
    });

    it('should include all other properties', () => {
      const partial = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roles: mockRoles,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const entity = new UserEntity(partial);
      const json = entity.toJSON();

      expect(Object.keys(json)).toEqual([
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'roles',
        'isActive',
        'createdAt',
        'updatedAt',
      ]);
    });
  });
});
