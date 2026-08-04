import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AuthUser, LoginCredentials } from '@/types/auth';
import { authClient } from '@/lib/auth-client';

// The auth client talks to the /api/auth/* proxy routes; the SOAP call and the
// session cookie both live server-side. Only fetch and local storage are mocked.
const mockAuthStorage = vi.hoisted(() => ({
  storeAuthToken: vi.fn(),
  getAuthToken: vi.fn(),
  clearAuthToken: vi.fn(),
  storeUser: vi.fn(),
  getStoredUser: vi.fn<() => AuthUser | null>(),
  clearUser: vi.fn(),
  clearAllAuthData: vi.fn(),
  isSecureStorage: vi.fn(),
  getTokenExpiryHours: vi.fn<() => number>(),
  hasStoredAuth: vi.fn(),
  refreshTokenExpiry: vi.fn(),
}));

vi.mock('@/lib/auth-storage', () => ({
  authStorage: mockAuthStorage,
  ...mockAuthStorage,
}));

const mockFetch = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, init?: { ok?: boolean; status?: number }) {
  return {
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    statusText: '',
    json: async () => body,
  } as unknown as Response;
}

const credentials: LoginCredentials = {
  serverUrl: 'https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx',
  username: '001',
  password: 'test-password',
  timeout: 30,
};

const storedUser: AuthUser = {
  username: '001',
  loginGuid: 'stored-in-cookie',
  systemname: 'S0144BrfAsen',
  isAuthenticated: true,
  loginTime: new Date(),
  apartmentNumber: '001',
  serverAddress: credentials.serverUrl,
};

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);
    mockAuthStorage.getTokenExpiryHours.mockReturnValue(24);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('should complete successful login flow', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ success: true, username: '001', systemname: 'S0144BrfAsen' }),
    );

    const user = await authClient.login(credentials);

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    expect(mockAuthStorage.storeUser).toHaveBeenCalledWith(user);

    expect(user.username).toBe('001');
    expect(user.systemname).toBe('S0144BrfAsen');
    expect(user.isAuthenticated).toBe(true);
    expect(user.apartmentNumber).toBe('001');
    expect(user.serverAddress).toBe(credentials.serverUrl);
    // The session token stays in the HttpOnly cookie set by the API route.
    expect(user.loginGuid).toBe('stored-in-cookie');
    expect(user.expiresAt).toBeInstanceOf(Date);
    expect(user.loginTime).toBeInstanceOf(Date);
  });

  test('should handle login failure correctly', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ error: 'Invalid credentials' }, { ok: false, status: 401 }),
    );

    await expect(authClient.login(credentials)).rejects.toThrow(
      'Authentication failed: Invalid credentials',
    );
    expect(mockAuthStorage.clearAllAuthData).toHaveBeenCalled();
    expect(mockAuthStorage.storeUser).not.toHaveBeenCalled();
  });

  test('should complete successful logout flow', async () => {
    mockAuthStorage.getStoredUser.mockReturnValue(storedUser);
    mockFetch.mockResolvedValue(jsonResponse({ success: true }));

    await authClient.logout();

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverUrl: credentials.serverUrl }),
    });
    expect(mockAuthStorage.clearAllAuthData).toHaveBeenCalled();
  });

  test('should clear local auth data even when server logout fails', async () => {
    mockAuthStorage.getStoredUser.mockReturnValue(storedUser);
    mockFetch.mockRejectedValue(new Error('Network error'));

    await expect(authClient.logout()).resolves.toBeUndefined();
    expect(mockAuthStorage.clearAllAuthData).toHaveBeenCalled();
  });
});
