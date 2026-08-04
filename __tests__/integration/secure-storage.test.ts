import { describe, test, expect, vi, beforeEach } from 'vitest';
import { authStorage } from '@/lib/auth-storage';

// Mock js-cookie. `vi.hoisted` keeps the mock object available to the hoisted
// `vi.mock` factory below.
const mockCookies = vi.hoisted(() => ({
  get: vi.fn<(key?: string) => string | undefined>(),
  set: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('js-cookie', () => ({
  default: mockCookies,
}));

describe('Secure Authentication Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should store auth token with secure settings', () => {
    const token = 'mock-login-guid-123';
    authStorage.storeAuthToken(token);

    expect(mockCookies.set).toHaveBeenCalledWith('loginGuid', token, {
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

    expect(mockCookies.get).toHaveBeenCalledWith('loginGuid');
    expect(retrieved).toBe(token);
  });

  test('should handle missing auth token gracefully', () => {
    mockCookies.get.mockReturnValue(undefined);
    const retrieved = authStorage.getAuthToken();
    expect(retrieved).toBeNull();
  });

  test('should clear auth token from storage', () => {
    authStorage.clearAuthToken();
    expect(mockCookies.remove).toHaveBeenCalledWith('loginGuid', {
      secure: false, // false in development, true in production
      sameSite: 'strict',
    });
  });
});
