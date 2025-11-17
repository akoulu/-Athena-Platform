import { validators } from './validators';

describe('validators', () => {
  it('should return validators string', () => {
    expect(validators()).toBe('validators');
  });

  it('should be a function', () => {
    expect(typeof validators).toBe('function');
  });
});
