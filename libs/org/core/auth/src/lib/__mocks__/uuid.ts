// Mock for uuid module
export function v4(): string {
  return 'mock-uuid-v4-' + Math.random().toString(36).substring(2, 15);
}

