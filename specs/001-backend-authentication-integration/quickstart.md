# Quickstart: Backend Authentication Integration

## Overview
This guide demonstrates the complete authentication flow from user login to displaying authenticated user information in the Doorman booking system.

## Prerequisites
- Next.js development environment running
- Access to VisionMobile SOAP API endpoint
- Valid apartment credentials for testing

## Test Scenario: Complete Authentication Flow

### 1. User Login Process

**Given**: User visits the application and needs to authenticate  
**When**: User navigates to `/login`  
**Then**: Login form displays with fields for server, apartment number, and password

**Expected UI Elements**:
- Server address input field
- Apartment number input (3-digit format)
- Password input (hidden)
- Submit button
- Loading indicator during authentication

### 2. Authentication Request

**When**: User submits valid credentials  
**Then**: System performs SOAP Login operation  

**Expected Behavior**:
- Form shows loading state
- SOAP request sent to VisionMobile API
- Credentials validated against backend
- `loginguid` token received and stored securely

### 3. Post-Authentication Display

**Given**: User successfully authenticated  
**When**: Redirected to main dashboard (`/`)  
**Then**: User information displayed in application header

**Expected UI Elements**:
- User's apartment number visible
- Logout button available
- Authentication status maintained across navigation
- Access to protected booking features

### 4. Session Persistence

**Given**: Authenticated user  
**When**: User refreshes page or navigates between routes  
**Then**: Authentication state maintained

**Expected Behavior**:
- Token retrieved from secure storage
- User session restored automatically
- No re-login required
- Protected content remains accessible

### 5. Error Handling

**Given**: User enters invalid credentials  
**When**: Login attempted  
**Then**: Clear error message displayed

**Expected Error Scenarios**:
- Invalid apartment number format
- Wrong password
- Server connection failure
- SOAP API unavailable

### 6. Logout Process

**Given**: Authenticated user  
**When**: User clicks logout  
**Then**: Session terminated and redirected to login

**Expected Behavior**:
- SOAP Logout operation called
- Local authentication state cleared
- Secure storage cleaned
- Redirect to login page

## Manual Testing Steps

### Step 1: Initial Setup
1. Start development server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Verify login form renders correctly

### Step 2: Valid Login
1. Enter server address: `https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx`
2. Enter valid 3-digit apartment number
3. Enter correct password
4. Click "Login" button
5. Verify loading state appears
6. Confirm redirect to dashboard on success

### Step 3: User Info Display
1. Check header/navigation for user information
2. Verify apartment number displays correctly
3. Confirm logout button is present
4. Navigate to different pages
5. Verify authentication persists

### Step 4: Invalid Login
1. Return to login page
2. Enter invalid credentials
3. Verify appropriate error message
4. Confirm no redirect occurs
5. Check form remains usable

### Step 5: Session Persistence
1. Authenticate successfully
2. Refresh the page (F5)
3. Verify user remains logged in
4. Open new tab to same domain
5. Confirm authentication carried over

### Step 6: Logout
1. From authenticated state
2. Click logout button
3. Verify SOAP logout call (check network tab)
4. Confirm redirect to login page
5. Verify user info no longer displayed

## Success Criteria

✅ **Login Form**: Renders correctly with all required fields  
✅ **Authentication**: SOAP API integration working  
✅ **Token Storage**: Secure storage implemented  
✅ **User Display**: Authenticated user info visible  
✅ **Navigation**: Auth state maintained across routes  
✅ **Error Handling**: Clear feedback for failures  
✅ **Logout**: Complete session termination  
✅ **Persistence**: Sessions survive page refresh  

## Troubleshooting

**Login fails with network error**:
- Check SOAP endpoint accessibility
- Verify CORS configuration
- Confirm HTTPS certificate validity

**Authentication succeeds but user info not displayed**:
- Check token storage implementation
- Verify React context propagation
- Confirm component re-rendering

**Session lost on page refresh**:
- Validate secure storage persistence
- Check token retrieval logic
- Verify context initialization

**SOAP requests malformed**:
- Compare with contract specifications
- Validate XML envelope structure
- Check required headers and encoding
