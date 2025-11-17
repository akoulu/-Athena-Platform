import { apiClient } from './api-client';

describe('apiClient', () => {
  it('should return api-client string', () => {
    expect(apiClient()).toBe('api-client');
  });

  it('should be a function', () => {
    expect(typeof apiClient).toBe('function');
  });
});
