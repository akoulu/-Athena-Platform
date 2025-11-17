import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY, Roles } from './roles.decorator';

// Mock SetMetadata
jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    SetMetadata: jest.fn((_key: string, _value: unknown) => () => {
      // Return a decorator function
    }),
  };
});

describe('Roles Decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export ROLES_KEY constant', () => {
    expect(ROLES_KEY).toBe('roles');
  });

  it('should be a string constant', () => {
    expect(typeof ROLES_KEY).toBe('string');
  });

  it('should return a function (decorator)', () => {
    const roles = ['admin', 'user'];
    const decorator = Roles(...roles);

    expect(typeof decorator).toBe('function');
  });

  it('should accept multiple role strings', () => {
    const roles = ['admin', 'user', 'moderator'];
    const decorator = Roles(...roles);

    expect(typeof decorator).toBe('function');
  });

  it('should accept single role string', () => {
    const decorator = Roles('admin');

    expect(typeof decorator).toBe('function');
  });

  it('should accept empty array', () => {
    const decorator = Roles();

    expect(typeof decorator).toBe('function');
  });

  it('should call SetMetadata with ROLES_KEY and roles array', () => {
    const roles = ['admin'];

    Roles(...roles);

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, roles);
  });

  it('should pass roles array to SetMetadata', () => {
    const roles = ['admin', 'user'];

    Roles(...roles);

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, ['admin', 'user']);
  });

  it('should pass empty array to SetMetadata when no roles provided', () => {
    Roles();

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, []);
  });
});
