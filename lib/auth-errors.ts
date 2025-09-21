/**
 * Authentication Error Handling Utilities
 * Handles SOAP fault parsing and error categorization
 * Based on research.md error handling strategy and SOAP specifications
 */

import type { AuthError } from '@/types/auth';
import type { SoapFault } from '@/types/soap';

// SOAP fault code mappings to AuthError types
const SOAP_ERROR_MAPPINGS: Record<string, AuthError['type']> = {
  'Client.Authentication': 'INVALID_CREDENTIALS',
  'Client.InvalidInput': 'INVALID_CREDENTIALS',
  'Server.Timeout': 'TIMEOUT',
  'Server.Internal': 'SERVER_ERROR',
  'Server.Unavailable': 'NETWORK',
  'Server.Database': 'SERVER_ERROR',
};

// Known error messages that indicate specific error types
const ERROR_MESSAGE_PATTERNS = {
  network: [
    'network error',
    'connection failed',
    'fetch failed',
    'connection timeout',
    'unable to connect',
    'network is unreachable',
  ],
  credentials: [
    'invalid credentials',
    'authentication failed',
    'login failed',
    'invalid username',
    'invalid password',
    'access denied',
    'unauthorized',
  ],
  timeout: [
    'timeout',
    'request timed out',
    'operation timed out',
    'deadline exceeded',
  ],
  server: [
    'internal server error',
    'server error',
    'service unavailable',
    'bad gateway',
    'gateway timeout',
  ],
};

/**
 * Parse SOAP fault into structured AuthError
 */
export function parseSoapFault(fault: SoapFault): AuthError {
  const errorType = SOAP_ERROR_MAPPINGS[fault.faultCode] || 'SERVER_ERROR';
  
  return {
    type: errorType,
    message: fault.faultString || 'Authentication service error',
    details: fault.detail,
    retryable: shouldRetry(errorType, fault.faultCode),
  };
}

/**
 * Create AuthError from JavaScript Error object
 */
export function createAuthError(error: Error | unknown): AuthError {
  const message = error instanceof Error ? error.message : 'Unknown authentication error';
  const errorType = categorizeError(message);
  
  return {
    type: errorType,
    message: getUserFriendlyMessage(errorType, message),
    details: error instanceof Error ? error.stack : undefined,
    retryable: shouldRetry(errorType),
  };
}

/**
 * Create AuthError for network-related failures
 */
export function createNetworkError(originalError?: Error): AuthError {
  return {
    type: 'NETWORK',
    message: 'Unable to connect to the authentication server. Please check your internet connection and try again.',
    details: originalError?.message,
    retryable: true,
  };
}

/**
 * Create AuthError for timeout scenarios
 */
export function createTimeoutError(timeoutSeconds?: number): AuthError {
  const timeoutMessage = timeoutSeconds 
    ? `Authentication request timed out after ${timeoutSeconds} seconds.`
    : 'Authentication request timed out.';
    
  return {
    type: 'TIMEOUT',
    message: `${timeoutMessage} Please try again.`,
    retryable: true,
  };
}

/**
 * Create AuthError for invalid credentials
 */
export function createInvalidCredentialsError(details?: string): AuthError {
  return {
    type: 'INVALID_CREDENTIALS',
    message: 'Invalid apartment number or password. Please check your credentials and try again.',
    details,
    retryable: false,
  };
}

/**
 * Categorize error based on message content
 */
function categorizeError(message: string): AuthError['type'] {
  const lowerMessage = message.toLowerCase();
  
  for (const [type, patterns] of Object.entries(ERROR_MESSAGE_PATTERNS)) {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      switch (type) {
        case 'network':
          return 'NETWORK';
        case 'credentials':
          return 'INVALID_CREDENTIALS';
        case 'timeout':
          return 'TIMEOUT';
        case 'server':
          return 'SERVER_ERROR';
      }
    }
  }
  
  return 'SERVER_ERROR';
}

/**
 * Determine if an error type should allow retry
 */
function shouldRetry(errorType: AuthError['type'], faultCode?: string): boolean {
  switch (errorType) {
    case 'NETWORK':
    case 'TIMEOUT':
    case 'SERVER_ERROR':
      return true;
    case 'INVALID_CREDENTIALS':
      return false;
    default:
      // For SOAP faults, check specific codes
      return faultCode ? !faultCode.startsWith('Client.') : false;
  }
}

/**
 * Get user-friendly error message based on error type
 */
function getUserFriendlyMessage(errorType: AuthError['type'], originalMessage: string): string {
  switch (errorType) {
    case 'NETWORK':
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    
    case 'INVALID_CREDENTIALS':
      return 'Invalid apartment number or password. Please check your credentials and try again.';
    
    case 'TIMEOUT':
      return 'The request took too long to complete. Please try again.';
    
    case 'SERVER_ERROR':
      return 'The authentication server is currently experiencing issues. Please try again later.';
    
    default:
      return originalMessage || 'An unexpected error occurred during authentication.';
  }
}

/**
 * Check if an error indicates the service is temporarily unavailable
 */
export function isServiceUnavailable(error: AuthError): boolean {
  return error.type === 'NETWORK' || error.type === 'SERVER_ERROR' || error.type === 'TIMEOUT';
}

/**
 * Check if an error indicates invalid user input
 */
export function isUserInputError(error: AuthError): boolean {
  return error.type === 'INVALID_CREDENTIALS';
}

/**
 * Get suggested action for user based on error type
 */
export function getErrorAction(error: AuthError): string {
  switch (error.type) {
    case 'NETWORK':
      return 'Check your internet connection and try again';
    
    case 'INVALID_CREDENTIALS':
      return 'Please verify your apartment number and password';
    
    case 'TIMEOUT':
      return 'Try again with a slower internet connection';
    
    case 'SERVER_ERROR':
      return 'Wait a moment and try again';
    
    default:
      return 'Try again or contact support if the problem persists';
  }
}

/**
 * Format error for logging (removes sensitive information)
 */
export function formatErrorForLogging(error: AuthError): Record<string, unknown> {
  return {
    type: error.type,
    message: error.message,
    retryable: error.retryable,
    timestamp: new Date().toISOString(),
    // Exclude details to avoid logging sensitive information
  };
}
