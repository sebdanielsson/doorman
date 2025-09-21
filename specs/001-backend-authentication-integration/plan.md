
# Implementation Plan: Backend Authentication Integration

**Branch**: `001-backend-authentication-integration` | **Date**: 2025-09-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-backend-authentication-integration/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Backend Authentication Integration - Implement login functionality to connect existing UI to backend authentication service and display authenticated user data. Primary requirement is to authenticate users using apartment number, password, and server address against the centralized SOAP backend service, with proper token management and user session handling.

## Technical Context

**Language/Version**: TypeScript 5.9 with Next.js 15.5.3 and React 19.1.0  
**Primary Dependencies**: Next.js App Router, Radix UI components, React Hook Form 7.60.0, Zod 4.0.5 for validation, Tailwind CSS 4.1.11  
**Storage**: HttpOnly cookies for authentication tokens, secure browser storage for user session data  
**Testing**: Jest with testing configuration already established in repository  
**Target Platform**: Web application (Next.js SSG/SSR hybrid) deployable as static assets  
**Project Type**: web - determines source structure (app/ directory with Next.js App Router)  
**Performance Goals**: Core content load within 2 seconds on 3G connections, authentication flow <500ms response time  
**Constraints**: SOAP API integration required with exact parameter types (xsi:type specifications), HTTPS-only communication, no sensitive data in localStorage, CORS restrictions require server-side proxy via Next.js API routes  
**Scale/Scope**: Single tenant booking system with authenticated user sessions, SOAP backend integration with proper loginguid token management

**User-Provided Context**: Full API URL must be provided: https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx. Request body must specify types using xsi:type attributes (xsd:string for text fields, xsd:int for timeout). Example systemname should be short identifier like "S0144BrfAsen", not full URL.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Security-First Authentication**: ✅ PASS
- Authentication tokens will be stored in HttpOnly cookies (secure storage)
- SOAP authentication uses HTTPS communication
- Session timeout and renewal mechanisms planned
- No sensitive data in localStorage (constitution requirement met)

**Performance & Accessibility**: ✅ PASS  
- Target <2 seconds load time on 3G (aligns with requirement)
- Will implement WCAG 2.1 AA standards for login form
- Mobile-first responsive design for authentication UI
- Authentication flow optimized for <500ms response time

**Component-Driven Architecture**: ✅ PASS
- Login form will use existing shadcn/ui + Tailwind pattern
- TypeScript with strict types for all authentication components
- React components following established patterns
- Independent testability for auth components

**Static-First Deployment**: ✅ PASS
- Authentication works with static deployment (server-side proxy API calls)
- SSR for initial login page load
- Client-side routing post-authentication
- SOAP API calls proxied through Next.js API routes (bypasses CORS)

**Progressive Enhancement**: ✅ PASS
- Login form works without JavaScript (basic form submission)
- Enhanced features layer on top (real-time validation, loading states)
- Graceful degradation for network failures during auth

**API Documentation Adherence**: ✅ PASS
- Following exact SOAP specifications with xsi:type parameters
- Using documented authentication flow with loginguid tokens
- No undocumented endpoints or assumptions
- Referencing existing API documentation in docs/ directory

**Modern JavaScript Standards**: ✅ PASS
- TypeScript (.tsx) for all new authentication components
- ESM syntax exclusively
- Bun package manager already established in project
- Strict mode TypeScript compilation

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (Single project) - Using Next.js App Router structure already established in repository. Authentication components will integrate with existing app/ directory structure.

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- SOAP authentication contract → contract test task [P]
- Authentication state entity → auth context creation task [P]
- User session entity → session management task [P] 
- Login form user story → integration test task
- Auth guard user story → route protection integration test
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Types → Utilities → Components → Integration
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md covering:
1. Contract tests for SOAP authentication (2-3 tasks)
2. Type definitions and validation schemas (2-3 tasks)
3. SOAP client utilities (2-3 tasks)
4. Authentication context and hooks (3-4 tasks)
5. Login form components (3-4 tasks)
6. Auth guard implementation (2-3 tasks)
7. Integration tests (3-4 tasks)
8. Error handling and loading states (2-3 tasks)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan## Phase 3+: Future Implementation

*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

## Progress Tracking

*This checklist is updated during execution flow*

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [x] Phase 4: Implementation complete ✅
- [x] Phase 5: Validation passed ✅

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none identified)

**Implementation Notes**:
- ✅ SOAP namespace format critical: `http://www.rco.se/Api/Mobile` (no trailing slash)
- ✅ Timeout must be 1200 minutes to match iOS app behavior
- ✅ HttpOnly cookies successfully implemented for secure token storage
- ✅ Next.js API proxy resolves CORS restrictions for SOAP requests
- ✅ Authentication flow working end-to-end with proper error handling

---
*Based on Constitution v1.1.0 - See `/memory/constitution.md`*
