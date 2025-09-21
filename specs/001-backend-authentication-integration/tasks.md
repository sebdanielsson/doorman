# Tasks: Backend Authentication Integration

**Input**: Design documents from `/specs/001-backend-authentication-integration/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend-only Next.js app**: `app/`, `components/`, `lib/`, `hooks/`, `types/`
- Paths assume Next.js App Router structure per project type

## Phase 3.1: Setup & Types
- [x] T001 [P] Create authentication types in `types/auth.ts` based on data-model.md entities
- [x] T002 [P] Create SOAP client types in `types/soap.ts` for request/response interfaces
- [x] T003 [P] Add authentication dependencies to package.json (js-cookie for cookie handling)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test SOAP Login request/response in `__tests__/contracts/soap-login.test.ts`
- [x] T005 [P] Contract test SOAP Logout request/response in `__tests__/contracts/soap-logout.test.ts`
- [x] T006 [P] Integration test authentication flow in `__tests__/integration/auth-flow.test.ts`
- [x] T007 [P] Integration test secure storage in `__tests__/integration/secure-storage.test.ts`
- [x] T008 [P] Component test login form validation in `__tests__/components/login-form.test.tsx`

## Phase 3.3: Core Authentication Infrastructure (ONLY after tests are failing)
- [x] T009 [P] Secure storage utility in `lib/auth-storage.ts` with HttpOnly cookies + localStorage fallback
- [x] T010 [P] SOAP client implementation in `lib/soap-client.ts` with XML templates per contracts
- [x] T011 [P] Authentication context in `lib/auth-context.tsx` with React context + custom hooks
- [x] T012 [P] Form validation schemas in `lib/auth-validation.ts` using Zod per LoginCredentials model
- [x] T013 [P] Error handling utilities in `lib/auth-errors.ts` for SOAP fault parsing

## Phase 3.4: Component Integration
- [x] T014 Enhance login form in `components/login-form.tsx` with authentication logic and validation
- [x] T015 [P] Create user display component in `components/user-info.tsx` for authenticated state
- [x] T016 Update header wrapper in `components/header-wrapper.tsx` to show user info and logout
- [x] T017 [P] Create loading spinner component in `components/ui/auth-spinner.tsx` for auth states
- [x] T018 [P] Create authentication guard hook in `hooks/use-auth-guard.ts` for protected routes

## Phase 3.5: Page Integration & Routing
- [x] T019 Wrap app layout in `app/layout.tsx` with AuthContext provider
- [x] T020 Update login page in `app/login/page.tsx` with enhanced authentication flow
- [x] T021 [P] Add authentication guards to booking pages in `app/book/*/page.tsx`
- [x] T022 [P] Add authentication state checks to dashboard in `app/page.tsx`
- [x] T023 Implement automatic redirects for unauthenticated users

## Phase 3.6: Polish & Testing
- [x] T024 [P] Add comprehensive error messaging in `components/auth-error.tsx` (integrated into login form)
- [ ] T025 [P] Add loading states and accessibility improvements to auth components
- [ ] T026 [P] Update component stories in Storybook for authentication states
- [ ] T027 Run quickstart.md manual testing scenarios with .env credentials
- [ ] T028 Performance testing: <500ms authentication response time
- [ ] T029 [P] Update documentation with authentication integration details

## Dependencies
- Types & Setup (T001-T003) before all other tasks
- Tests (T004-T008) before implementation (T009-T026)
- Core infrastructure (T009-T013) before component integration (T014-T018)
- Component integration before page integration (T019-T023)
- T014 (form enhancement) blocks T020 (login page)
- T016 (header) blocks T019 (layout)
- Implementation before polish (T024-T029)

## Parallel Example
```bash
# Launch infrastructure tasks together after tests pass:
# T009: lib/secure-storage.ts
# T010: lib/soap-client.ts  
# T011: lib/auth-context.tsx
# T012: lib/auth-validation.ts
# T013: lib/auth-errors.ts

# Launch component tests together:
# T004: __tests__/contracts/soap-login.test.ts
# T005: __tests__/contracts/soap-logout.test.ts
# T006: __tests__/integration/auth-flow.test.ts
# T007: __tests__/integration/secure-storage.test.ts
# T008: __tests__/components/login-form.test.tsx
```

## Task Generation Rules Applied

1. **From Contracts** (soap-auth.md):
   - SOAP Login operation → T004, T010
   - SOAP Logout operation → T005, T010
   
2. **From Data Model** (data-model.md):
   - AuthenticationState → T001, T011
   - UserProfile → T001, T015
   - LoginCredentials → T001, T012
   - AuthError → T001, T013
   - SoapResponse/SoapFault → T002, T010
   
3. **From Research** (research.md):
   - Secure storage decision → T009
   - SOAP client decision → T010
   - React Context pattern → T011
   - Form validation strategy → T012
   - Error handling strategy → T013

4. **From Quickstart** (quickstart.md):
   - Manual testing scenarios → T027
   - Authentication flow testing → T006
   - Performance requirements → T028

## Validation Checklist
- [x] All contracts have corresponding tests (T004-T005)
- [x] All entities have implementation tasks (T001, T009-T013)
- [x] All tests come before implementation (T004-T008 before T009+)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Authentication integration follows constitutional requirements
- [x] SOAP API specification adherence maintained
