# Tasks: Real News/Announcements Display

**Input**: Design documents from `/Users/sebastian/Git/doorman/specs/002-now-that-we/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Found: TypeScript 5.9, Next.js 15.5.3, React 19.1.0
   → Extract: Next.js App Router, SOAP API proxy routes, existing auth
2. Load optional design documents:
   → data-model.md: TrmMessageLite, AnnouncementItem, AnnouncementsList entities
   → contracts/: soap-announcements.md, api-routes.md contracts
   → research.md: Filtering logic, caching strategy, error handling
3. Generate tasks by category:
   → Setup: TypeScript types, SOAP client extension
   → Tests: SOAP contract tests, API route tests, component tests
   → Core: Type definitions, SOAP operations, API routes, component updates
   → Integration: Error handling, caching, image loading
   → Polish: Accessibility tests, performance validation, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests ✓
   → All entities have types ✓
   → All endpoints implemented ✓
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js App Router structure with API routes
- All paths are absolute from repository root

## Phase 3.1: Setup

- [x] T001 Create TypeScript type definitions for SOAP entities in `/Users/sebastian/Git/doorman/types/soap.ts`
- [x] T002 [P] Create TypeScript type definitions for announcements UI in `/Users/sebastian/Git/doorman/types/announcements.ts`
- [x] T003 [P] Install and configure DOMPurify for HTML sanitization

## Phase 3.2: Tests First (TDD) ✅

| Task ID | Description                                                      | Status  | Notes                                            |
| ------- | ---------------------------------------------------------------- | ------- | ------------------------------------------------ |
| T004    | Write contract test for GetAllTerminalMessageLite SOAP operation | ✅ Done | Created comprehensive contract tests             |
| T005    | Write API route test for `/api/announcements`                    | ✅ Done | Tests authentication, pagination, error handling |
| T006    | Write integration test for announcements flow                    | ✅ Done | End-to-end user journey tests                    |
| T007    | Write component tests for announcements display                  | ✅ Done | UI component tests with mocks                    |

## Phase 3.3: Core Implementation ✅

- [x] T010 [P] Extend SOAP client with GetAllTerminalMessageLite operation in `/Users/sebastian/Git/doorman/lib/soap-client.ts`
- [x] T011 [P] Extend SOAP client with GetTerminalMessageImage operation in `/Users/sebastian/Git/doorman/lib/soap-client.ts`
- [x] T012 [P] Create data transformation utilities for TrmMessageLite to AnnouncementItem in `/Users/sebastian/Git/doorman/lib/announcements-utils.ts`
- [x] T013 [P] Create HTML sanitization utilities in `/Users/sebastian/Git/doorman/lib/sanitization.ts`
- [x] T014 Create API route for GET /api/announcements in `/Users/sebastian/Git/doorman/app/api/announcements/route.ts`
- [ ] T015 Create API route for GET /api/announcements/[messageId]/image in `/Users/sebastian/Git/doorman/app/api/announcements/[messageId]/image/route.ts`
- [ ] T016 Update announcements component to use real data in `/Users/sebastian/Git/doorman/components/announcements.tsx`

## Phase 3.4: Integration

- [ ] T017 Add error handling and fallback logic to announcements component
- [ ] T018 [P] Implement client-side caching with 5-minute expiry
- [ ] T019 [P] Add loading states and skeleton UI to announcements component
- [ ] T020 [P] Implement lazy image loading functionality
- [ ] T021 Add content filtering logic to exclude PDF/DOCX-only posts
- [ ] T022 [P] Add accessibility improvements (ARIA labels, alt text)

## Phase 3.5: Polish

- [ ] T023 [P] Add unit tests for data transformation utilities in `/Users/sebastian/Git/doorman/__tests__/unit/announcements-utils.test.ts`
- [ ] T024 [P] Add unit tests for HTML sanitization in `/Users/sebastian/Git/doorman/__tests__/unit/sanitization.test.ts`
- [ ] T025 [P] Performance test: verify 2-second load time requirement
- [ ] T026 [P] Accessibility test: verify WCAG 2.1 AA compliance
- [ ] T027 [P] Update component documentation in Storybook (if exists)
- [ ] T028 Run quickstart validation scenarios from `/Users/sebastian/Git/doorman/specs/002-now-that-we/quickstart.md`

## Dependencies

- Setup (T001-T003) before all other phases
- Tests (T004-T009) before implementation (T010-T016)
- T010 blocks T014 (SOAP client needed for API route)
- T011 blocks T015 (SOAP image operation needed for image API route)
- T012, T013 block T016 (utilities needed for component)
- T014, T015 block T016 (API routes needed for component data fetching)
- Implementation (T010-T016) before integration (T017-T022)
- Integration before polish (T023-T028)

## Parallel Example - Phase 3.2 Tests

```bash
# Launch T004-T009 together (all test files are independent):
Task: "SOAP contract test for GetAllTerminalMessageLite in /Users/sebastian/Git/doorman/__tests__/contracts/soap-news.test.ts"
Task: "SOAP contract test for GetTerminalMessageImage in /Users/sebastian/Git/doorman/__tests__/contracts/soap-image.test.ts"
Task: "API route contract test for GET /api/announcements in /Users/sebastian/Git/doorman/__tests__/contracts/api-announcements.test.ts"
Task: "API route contract test for GET /api/announcements/[id]/image in /Users/sebastian/Git/doorman/__tests__/contracts/api-image.test.ts"
Task: "Integration test for news fetching flow in /Users/sebastian/Git/doorman/__tests__/integration/news-flow.test.ts"
Task: "Component test for updated announcements component in /Users/sebastian/Git/doorman/__tests__/components/announcements.test.ts"
```

## Parallel Example - Phase 3.3 Core Setup

```bash
# Launch T010-T013 together (different files, no dependencies):
Task: "Extend SOAP client with GetAllTerminalMessageLite operation in /Users/sebastian/Git/doorman/lib/soap-client.ts"
Task: "Create data transformation utilities for TrmMessageLite to AnnouncementItem in /Users/sebastian/Git/doorman/lib/announcements-utils.ts"
Task: "Create HTML sanitization utilities in /Users/sebastian/Git/doorman/lib/sanitization.ts"
```

## Notes

- [P] tasks = different files, no dependencies
- T010 and T011 both modify soap-client.ts so cannot be parallel
- Verify all tests fail before implementing T010-T016
- Commit after each task completion
- Follow existing authentication patterns from previous feature implementation

## Task Generation Rules Applied

1. **From Contracts**:
   - soap-announcements.md → T004, T005 (SOAP contract tests)
   - api-routes.md → T006, T007 (API route contract tests)
   - Each endpoint → T014, T015 (API route implementations)
2. **From Data Model**:
   - TrmMessageLite entity → T001 (SOAP types)
   - AnnouncementItem entity → T002 (UI types)
   - Transformation logic → T012 (utilities)
3. **From User Stories/Quickstart**:
   - Basic news fetching → T008 (integration test)
   - Component updates → T009 (component test)
   - Validation scenarios → T028 (quickstart execution)

4. **Ordering**:
   - Setup → Tests → SOAP Client → API Routes → Component → Polish
   - Dependencies enforced through sequential numbering

## Validation Checklist

- [x] All contracts have corresponding tests (T004-T007)
- [x] All entities have type definitions (T001-T002)
- [x] All tests come before implementation (T004-T009 before T010-T016)
- [x] Parallel tasks truly independent (verified file paths)
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] SOAP client extensions split appropriately (T010-T011 sequential)
- [x] Component update comes after dependencies (T016 after T012-T015)
