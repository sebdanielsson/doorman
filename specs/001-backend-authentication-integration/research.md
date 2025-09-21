# Research: Backend Authentication Integration

## Decision: SOAP Client Implementation

**Chosen**: Custom SOAP client using fetch API with XML string templates
**Rationale**:

- Browser-native fetch API provides cross-platform compatibility
- No heavy SOAP library dependencies needed for simple login/logout operations
- Direct control over request/response handling for error management
- Consistent with static-first deployment principle

**Alternatives considered**:

- soap.js library: Too heavy for simple authentication operations
- GraphQL wrapper: Not applicable for existing SOAP API
- Proxy server: Violates static-first deployment principle

## Decision: Authentication Token Storage

**Chosen**: HttpOnly cookies with secure localStorage fallback
**Rationale**:

- HttpOnly cookies prevent XSS access to authentication tokens
- Secure, SameSite=Strict attributes provide CSRF protection
- Automatic inclusion in requests simplifies API integration
- localStorage fallback for environments where cookies aren't available

**Alternatives considered**:

- localStorage only: Vulnerable to XSS attacks
- sessionStorage only: Lost on tab close, poor UX
- Memory only: Lost on page refresh, poor UX

## Decision: Session Management Pattern

**Chosen**: React Context + Custom Hook pattern
**Rationale**:

- Centralized authentication state management
- Type-safe session access throughout component tree
- Consistent with existing component architecture
- Automatic cleanup on logout/expiration

**Alternatives considered**:

- Redux/Zustand: Overkill for authentication-only state
- Component props: Too much prop drilling
- Global variables: Not reactive, poor DX

## Decision: Error Handling Strategy

**Chosen**: Layered error handling with user-friendly messages
**Rationale**:

- SOAP fault parsing for server errors
- Network error detection and retry logic
- User-friendly error messages for common authentication failures
- Accessibility-compliant error announcements

**Alternatives considered**:

- Generic error messages: Poor UX for troubleshooting
- Technical error display: Confusing for end users
- No error handling: Violates constitutional principles

## Decision: Form Validation Strategy

**Chosen**: Zod schema validation with React Hook Form
**Rationale**:

- Type-safe validation matching API requirements
- Consistent with existing form patterns in codebase
- Real-time validation feedback for better UX
- Server/apartment number/password field validation

**Alternatives considered**:

- Manual validation: Error-prone, inconsistent
- HTML5 validation only: Limited customization
- Third-party validation library: Inconsistent with existing patterns

## Decision: Loading State Management

**Chosen**: Component-level loading states with global auth status
**Rationale**:

- Immediate user feedback during authentication
- Prevents multiple concurrent login attempts
- Maintains component independence
- Follows existing loading pattern in booking components

**Alternatives considered**:

- Global loading only: Less granular control
- No loading states: Poor UX for slow networks
- Progressive loading: Overcomplicated for authentication

## Decision: SOAP Request Format

**Chosen**: XML string templates with dynamic value injection
**Rationale**:

- Matches exact SOAP 1.1 specification requirements
- Direct control over XML structure and encoding
- Simple debugging and testing of requests
- No XML parsing library dependencies

**Alternatives considered**:

- XML builder library: Additional dependency overhead
- JSON-to-XML conversion: Risk of format errors
- Generic HTTP client: Would require manual SOAP envelope construction
