import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
  it('should be instantiable', () => {
    const guard = new LocalAuthGuard();
    expect(guard).toBeDefined();
  });

  it('should be an instance of LocalAuthGuard', () => {
    const guard = new LocalAuthGuard();
    expect(guard).toBeInstanceOf(LocalAuthGuard);
  });
});
