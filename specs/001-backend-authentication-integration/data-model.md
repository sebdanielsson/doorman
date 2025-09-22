# Data Model: Backend Authentication Integration

## Core Entities

### AuthenticationState

**Purpose**: Application-wide authentication status tracking
**Attributes**:

- `isAuthenticated: boolean` - Current authentication status
- `isLoading: boolean` - Whether authentication request is in progress
- `user: UserProfile | null` - Authenticated user information
- `token: string | null` - Session login GUID
- `error: AuthError | null` - Last authentication error

**State Transitions**:

- `IDLE` → `LOADING` (login attempt)
- `LOADING` → `AUTHENTICATED` (login success)
- `LOADING` → `ERROR` (login failure)
- `AUTHENTICATED` → `IDLE` (logout)
- `AUTHENTICATED` → `ERROR` (token expiration)

### UserProfile

**Purpose**: Basic user information from successful authentication
**Attributes**:

- `apartmentNumber: string` - User's apartment identifier
- `serverAddress: string` - SOAP server endpoint
- `displayName?: string` - Optional display name for UI
- `loginTime: Date` - When authentication occurred
- `expiresAt?: Date` - Token expiration timestamp

**Validation Rules**:

- `apartmentNumber` must be 3-digit numeric string
- `serverAddress` must be valid URL format
- `loginTime` cannot be in the future

### LoginCredentials

**Purpose**: User input for authentication request
**Attributes**:

- `serverUrl: string` - Full SOAP API endpoint URL
- `username: string` - Apartment number (3 digits)
- `password: string` - User password
- `timeout: number` - Session timeout in minutes

**Validation Rules**:

- `serverUrl` must be valid HTTPS URL with correct API path structure
- `username` must match pattern /^\d{3}$/
- `password` required, minimum 1 character
- `timeout` must be positive integer

**Derived Values**:

- `systemname` extracted from URL path (e.g., "S0144BrfAsen" from "/S0144BrfAsen/api/mobile/visionmobile.asmx")

### AuthError

**Purpose**: Structured error information for authentication failures
**Attributes**:

- `type: 'NETWORK' | 'INVALID_CREDENTIALS' | 'SERVER_ERROR' | 'TIMEOUT'`
- `message: string` - User-friendly error message
- `details?: string` - Technical details for debugging
- `retryable: boolean` - Whether user can retry the operation

### SoapResponse

**Purpose**: Structured SOAP API response handling
**Attributes**:

- `success: boolean` - Whether operation succeeded
- `data?: any` - Response payload (loginguid for login)
- `fault?: SoapFault` - SOAP fault information
- `rawResponse: string` - Original XML response

### SoapFault

**Purpose**: SOAP fault error parsing
**Attributes**:

- `faultCode: string` - SOAP fault code
- `faultString: string` - Fault description
- `detail?: string` - Additional fault details

## Relationships

- `AuthenticationState` contains one `UserProfile` when authenticated
- `AuthenticationState` contains one `AuthError` when authentication fails
- `LoginCredentials` transforms into `UserProfile` on successful authentication
- `SoapResponse` may contain `SoapFault` on server errors

## State Management Patterns

### Authentication Context

```typescript
interface AuthContextValue {
  state: AuthenticationState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}
```

### Secure Storage Interface

```typescript
interface SecureStorage {
  setToken: (token: string) => Promise<void>;
  getToken: () => Promise<string | null>;
  removeToken: () => Promise<void>;
  isAvailable: () => boolean;
}
```

### SOAP Client Interface

```typescript
interface SoapClient {
  login: (credentials: LoginCredentials) => Promise<SoapResponse>;
  logout: (loginguid: string) => Promise<SoapResponse>;
  isHealthy: () => Promise<boolean>;
}
```
