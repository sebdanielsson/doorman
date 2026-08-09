/**
 * Authentication Form Validation Schemas
 * Uses Zod for runtime type validation per LoginCredentials model
 * Based on data-model.md entities and research.md validation strategy
 */

import { z } from 'zod';
import { isValidSoapEndpoint } from './soap-endpoint';

// Login credentials validation schema
export const loginCredentialsSchema = z.object({
  serverUrl: z
    .string()
    .min(1, 'Server URL is required')
    .max(255, 'Server URL is too long')
    .url('Please enter a valid server URL')
    .refine(isValidSoapEndpoint, 'Server URL must be a public https VisionMobile API endpoint'),

  username: z
    .string()
    .min(1, 'Apartment number is required')
    .regex(/^\d{3}$/, 'Apartment number must be exactly 3 digits')
    .refine(
      (val) => parseInt(val) >= 1 && parseInt(val) <= 999,
      'Apartment number must be between 001 and 999',
    ),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(4, 'Password must be at least 4 characters')
    .max(50, 'Password is too long'),

  timeout: z
    .number()
    .int('Timeout must be an integer')
    .min(10, 'Timeout must be at least 10 seconds')
    .max(1800, 'Timeout cannot exceed 30 minutes'), // Allow iOS timeout of 1200
});

// Type inference from schema
export type LoginCredentialsInput = z.infer<typeof loginCredentialsSchema>;

// Individual field validation schemas for real-time validation
export const serverAddressSchema = z
  .string()
  .min(1, 'Server address is required')
  .url('Please enter a valid server URL');

export const apartmentNumberSchema = z
  .string()
  .min(1, 'Apartment number is required')
  .regex(/^\d{3}$/, 'Apartment number must be exactly 3 digits');

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(4, 'Password must be at least 4 characters');

// Validation result type
export interface ValidationResult {
  success: boolean;
  error?: string;
  data?: LoginCredentialsInput;
}

/**
 * Validate login credentials and return result with proper error handling
 */
export function validateLoginCredentials(input: unknown): ValidationResult {
  try {
    const result = loginCredentialsSchema.safeParse(input);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      // Extract the first validation error message
      const firstError = result.error.issues[0];
      return {
        success: false,
        error: firstError.message,
      };
    }
  } catch {
    return {
      success: false,
      error: 'Validation failed due to unexpected error',
    };
  }
}

/**
 * Validate individual field for real-time feedback
 */
export function validateField(
  fieldName: keyof LoginCredentialsInput,
  value: unknown,
): ValidationResult {
  try {
    let schema: z.ZodSchema;

    switch (fieldName) {
      case 'serverUrl':
        schema = serverAddressSchema;
        break;
      case 'username':
        schema = apartmentNumberSchema;
        break;
      case 'password':
        schema = passwordSchema;
        break;
      case 'timeout':
        schema = z.number().int().min(10).max(300);
        break;
      default:
        return { success: false, error: 'Unknown field' };
    }

    const result = schema.safeParse(value);

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error.issues[0].message,
      };
    }
  } catch {
    return {
      success: false,
      error: 'Field validation failed',
    };
  }
}

/**
 * Transform raw form data to typed credentials
 */
export function transformFormData(formData: Record<string, unknown>): LoginCredentialsInput {
  return {
    serverUrl: String(formData.serverUrl || ''),
    username: String(formData.username || ''),
    password: String(formData.password || ''),
    timeout: Number(formData.timeout) || 30,
  };
}

/**
 * Get user-friendly validation error messages
 */
export function getFieldErrorMessage(
  fieldName: keyof LoginCredentialsInput,
  error: string,
): string {
  const fieldDisplayNames = {
    serverUrl: 'Server URL',
    username: 'Apartment number',
    password: 'Password',
    timeout: 'Timeout',
  };

  const displayName = fieldDisplayNames[fieldName];

  // Return more specific error messages for common validation failures
  if (error.includes('required')) {
    return `${displayName} is required`;
  }

  if (error.includes('url') || error.includes('URL')) {
    return 'Please enter a valid server URL (e.g., https://example.com/api/mobile/visionmobile.asmx)';
  }

  if (error.includes('3 digits')) {
    return 'Apartment number must be exactly 3 digits (e.g., 001, 042, 123)';
  }

  if (error.includes('4 characters')) {
    return 'Password must be at least 4 characters long';
  }

  return error;
}
