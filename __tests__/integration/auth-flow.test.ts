import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import type { AuthUser, LoginCredentials } from '@/types/auth';
import type { LoginRequest, LoginResponse, LogoutResponse } from '@/types/soap';

// Mock all dependencies
const mockSoapClient = {
  login: jest.fn() as jest.MockedFunction<(credentials: LoginRequest) => Promise<LoginResponse>>,
  logout: jest.fn() as jest.MockedFunction<(loginguid: string) => Promise<LogoutResponse>>,
  isHealthy: jest.fn() as jest.MockedFunction<() => Promise<boolean>>,
};
jest.mock('../../lib/soap-client', () => ({
  soapClient: mockSoapClient,
}));

const mockAuthStorage = {
  storeAuthToken: jest.fn(),
  getAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
  storeUser: jest.fn(),
  getStoredUser: jest.fn(),
  clearUser: jest.fn(),
  clearAllAuthData: jest.fn(),
  isSecureStorage: jest.fn(),
  getTokenExpiryHours: jest.fn(),
  hasStoredAuth: jest.fn(),
  refreshTokenExpiry: jest.fn(),
};
jest.mock('../../lib/auth-storage', () => ({
  authStorage: mockAuthStorage,
}));

describe('Authentication Flow Integration', () => {
  let authClient: any;

  beforeEach(async () => {
    const { authClient: client } = await import('../../lib/auth-client');
    authClient = client;
    jest.clearAllMocks();
  });

  test('should complete successful login flow', async () => {
    const credentials = {
      systemname: 'test-system',
      username: '001',
      password: 'test-password',
      timeout: 30,
    };

    const mockLoginResponse: LoginResponse = {
      LoginResult: 'mock-login-guid-123',
    };

    mockSoapClient.login.mockResolvedValue(mockLoginResponse);
    mockAuthStorage.getTokenExpiryHours.mockReturnValue(24);

    const user = await authClient.login(credentials);

    expect(mockSoapClient.login).toHaveBeenCalledWith({
      systemname: 'test-system',
      username: '001',
      Password: 'test-password',
      timeout: 30,
    });
    expect(mockAuthStorage.storeAuthToken).toHaveBeenCalledWith('mock-login-guid-123');
    expect(mockAuthStorage.storeUser).toHaveBeenCalled();
    
    // Verify the essential user properties
    expect(user.username).toBe('001');
    expect(user.loginGuid).toBe('mock-login-guid-123');
    expect(user.systemname).toBe('test-system');
    expect(user.isAuthenticated).toBe(true);
    expect(user.apartmentNumber).toBe('001');
    expect(user.serverAddress).toBe('test-system');
    expect(user.expiresAt).toBeInstanceOf(Date);
    expect(user.loginTime).toBeInstanceOf(Date);
  });

  test('should handle login failure correctly', async () => {
    const credentials = {
      systemname: 'test-system',
      username: '001',
      password: 'wrong-password',
      timeout: 30,
    };

    mockSoapClient.login.mockRejectedValue(new Error('Invalid credentials'));

    await expect(authClient.login(credentials)).rejects.toThrow('Invalid credentials');
  });

  test('should complete successful logout flow', async () => {
    const mockUser: AuthUser = {
      username: '001',
      loginGuid: 'mock-login-guid-123',
      systemname: 'test-system',
      isAuthenticated: true,
      loginTime: new Date(),
      apartmentNumber: '001',
      serverAddress: 'test-system',
    };

    const mockLogoutResponse: LogoutResponse = {
      LogoutResult: true,
    };

    mockAuthStorage.getAuthToken.mockReturnValue('mock-login-guid-123');
    mockAuthStorage.getStoredUser.mockReturnValue(mockUser);
    mockSoapClient.logout.mockResolvedValue(mockLogoutResponse);

    await authClient.logout();

    expect(mockSoapClient.logout).toHaveBeenCalledWith('mock-login-guid-123');
    expect(mockAuthStorage.clearAllAuthData).toHaveBeenCalled();
  });
});
