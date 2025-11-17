// Setup file for users tests
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-v4-' + Math.random().toString(36).substring(2, 15)),
}));

