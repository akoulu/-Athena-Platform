import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('should be instantiable', () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeDefined();
  });

  it('should be an instance of JwtAuthGuard', () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });
});
