import { RolesGuard } from '../guards/roles.guard';

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() } as any;
  const guard = new RolesGuard(reflector);
  const ctx: any = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: { roles: ['admin'] } }),
    }),
  };

  it('allows when role matches', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(['admin']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('blocks when role missing', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(['user']);
    expect(() => guard.canActivate(ctx)).toThrow();
  });
});
