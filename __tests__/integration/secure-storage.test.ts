import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import type { AuthUser } from '@/types/auth';

// Mock js-cookie
const mockCookies = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
};
jest.mock('js-cookie', () => mockCookies);

describe('Secure Authentication Storage', () => {
  let authStorage: any;

  beforeEach(async () => {
    const { authStorage: storage } = await import('../../lib/auth-storage');
    authStorage = storage;
    jest.clearAllMocks();
  });

  test('should store auth token with secure settings', () => {
    const token = 'mock-login-guid-123';
    authStorage.storeAuthToken(token);

    expect(mockCookies.set).toHaveBeenCalledWith('auth_token', token, {
      httpOnly: false,
      secure: false, // false in development, true in production
      sameSite: 'strict',
      expires: expect.any(Number),
    });
  });

  test('should retrieve auth token from storage', () => {
    const token = 'mock-login-guid-123';
    mockCookies.get.mockReturnValue(token);

    const retrieved = authStorage.getAuthToken();

    expect(mockCookies.get).toHaveBeenCalledWith('auth_token');
    expect(retrieved).toBe(token);
  });

  test('should handle missing auth token gracefully', () => {
    mockCookies.get.mockReturnValue(undefined);
    const retrieved = authStorage.getAuthToken();
    expect(retrieved).toBeNull();
  });

  test('should clear auth token from storage', () => {
    authStorage.clearAuthToken();
    expect(mockCookies.remove).toHaveBeenCalledWith('auth_token', {
      secure: false, // false in development, true in production
      sameSite: 'strict',
    });
  });
});
