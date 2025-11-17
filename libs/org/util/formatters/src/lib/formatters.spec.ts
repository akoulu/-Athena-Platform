import { formatters } from './formatters';

describe('formatters', () => {
  it('should return formatters string', () => {
    expect(formatters()).toBe('formatters');
  });

  it('should be a function', () => {
    expect(typeof formatters).toBe('function');
  });
});
