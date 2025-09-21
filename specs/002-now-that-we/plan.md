# Implementation Plan: Real News/Announcements Display

**Branch**: `002-now-that-we` | **Date**: 2025-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/sebastian/Git/doorman/specs/002-now-that-we/spec.md`

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

Replace placeholder news/announcements with real data fetched from SOAP API's GetAllTerminalMessageLite operation. Filter to display only plaintext content (exclude PDF/DOCX-only posts), maintain existing pagination, and add image support when available. Technical approach: Extend existing authentication flow to fetch terminal messages, implement content filtering based on ContentType, and update announcements component to display real data.

## Technical Context

**Language/Version**: TypeScript 5.9 with Next.js 15.5.3 and React 19.1.0  
**Primary Dependencies**: Next.js App Router, Radix UI components, React Hook Form 7.60.0, Zod 4.0.5, Tailwind CSS 4.1.11  
**Storage**: HttpOnly cookies for authentication tokens, client-side caching for news data [NEEDS CLARIFICATION: What is the appropriate cache duration?]  
**Testing**: Jest with existing test infrastructure for components and integration tests  
**Target Platform**: Web application (browser-based)  
**Project Type**: web - frontend with API proxy routes for SOAP backend  
**Performance Goals**: Core content load within 2 seconds on 3G connections (constitutional requirement)  
**Constraints**: WCAG 2.1 AA accessibility, mobile-first responsive design, static-first deployment compatible  
**Scale/Scope**: Single feature enhancement to existing announcements component, estimated 10-20 news items per fetch [NEEDS CLARIFICATION: How to identify PDF/DOCX-only posts from ContentType field?] [NEEDS CLARIFICATION: Should items with both text and PDF/DOCX be included or excluded?] [NEEDS CLARIFICATION: How should related messages be grouped or linked?]

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

✅ **Security-First Authentication**: Uses existing HttpOnly cookie authentication with SOAP loginguid validation  
✅ **Performance & Accessibility**: Maintains existing 2-second load requirement, WCAG 2.1 AA compliance, mobile-first design  
✅ **Component-Driven Architecture**: Extends existing React components following shadcn/ui + Tailwind pattern, TypeScript strict mode  
✅ **Static-First Deployment**: Client-side API calls via Next.js API routes (existing proxy pattern), no SSR requirements  
✅ **Progressive Enhancement**: Core news reading functionality works without JavaScript via server-rendered content  
✅ **API Documentation Adherence**: Uses documented SOAP operations (GetAllTerminalMessageLite, GetTerminalMessageImage) with proper loginguid authentication  
✅ **Modern JavaScript Standards**: All new code in TypeScript with ESM modules, bun package management

**Result**: PASS - No constitutional violations detected

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

```text
# Option 2: Web application (frontend + backend detected via Next.js + API routes)
app/
├── api/
│   └── announcements/
│       ├── route.ts         # SOAP proxy for GetAllTerminalMessageLite
│       └── [messageId]/
│           └── image/
│               └── route.ts # SOAP proxy for GetTerminalMessageImage
├── globals.css
├── layout.tsx
└── page.tsx

components/
├── announcements.tsx        # Updated to use real data
└── ui/
    └── [existing components]

lib/
├── soap-client.ts          # Extended with news operations
├── auth-context.tsx        # Existing authentication
└── utils.ts

types/
├── auth.ts                 # Existing
├── soap.ts                 # Extended with TrmMessageLite
└── announcements.ts        # New: news display types

__tests__/
├── components/
│   └── announcements.test.ts # Updated tests
├── contracts/
│   ├── soap-news.test.ts    # New: SOAP contract tests
│   └── api-announcements.test.ts # New: API route tests
└── integration/
    └── news-flow.test.ts    # New: end-to-end news fetching
```

**Structure Decision**: Option 2 (Web application) - Next.js frontend with API proxy routes for SOAP backend

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

_Prerequisites: research.md complete_

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

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Based on Constitution v1.1.0 - See `/memory/constitution.md`_
