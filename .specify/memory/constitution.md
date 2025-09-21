<!--
Sync Impact Report:
Version change: 1.1.0 → 1.2.0
Modified principles: VII. Modern JavaScript Standards (new), updated Development Workflow
Added sections: VII. Modern JavaScript Standards principle, updated package manager requirement
Removed sections: None
Templates requiring updates: ✅ All validated (plan-template.md, spec-template.md, tasks-template.md compatible)
Follow-up TODOs: None
-->

# Doorman Web App Constitution

## Core Principles

### I. Security-First Authentication (NON-NEGOTIABLE)

Authentication tokens MUST be stored securely in HttpOnly cookies or secure browser storage. All API communications MUST use HTTPS. User sessions MUST implement proper timeout and renewal mechanisms. No sensitive data persists in localStorage or unencrypted storage.

**Rationale**: Replacing an iOS app requires equivalent security standards. Token-based authentication needs browser-appropriate storage to prevent XSS attacks.

### II. Performance & Accessibility

All pages MUST load core content within 2 seconds on 3G connections. Components MUST follow WCAG 2.1 AA accessibility standards. Progressive loading for booking calendars and time slots is required. Mobile-first responsive design is mandatory.

**Rationale**: Laundry booking is time-sensitive functionality that users expect to work quickly across all devices and accessibility needs.

### III. Component-Driven Architecture

Every UI element MUST be built as reusable React components following the established shadcn/ui + Tailwind pattern. Components MUST be independently testable and documented. No direct DOM manipulation outside of React lifecycle. All component logic MUST be written in TypeScript with strict type definitions.

**Rationale**: Maintains design consistency and enables efficient feature development for booking interfaces and forms. TypeScript ensures compile-time safety and better developer experience.

### IV. Static-First Deployment

All features MUST work as static assets deployable to CDN. Server-side rendering (SSR) for SEO and initial load only. Client-side routing for navigation. API calls handled via client-side requests to external booking system.

**Rationale**: Static deployment ensures reliability, performance, and cost-effectiveness for a booking interface that primarily consumes existing APIs.

### V. Progressive Enhancement

Core booking functionality MUST work without JavaScript. Enhanced features (real-time updates, animations) layer on top. Graceful degradation for network failures. Offline-capable reading of existing bookings.

**Rationale**: Ensures booking functionality remains available under all network conditions, critical for time-sensitive laundry reservations.

### VI. API Documentation Adherence (NON-NEGOTIABLE)

All backend integrations MUST reference the official API documentation in `./docs/` before implementation. SOAP operations MUST follow the exact specifications including parameter names, types, and authentication flow using `loginguid`. No API assumptions or undocumented endpoints are permitted.

**Rationale**: The backend is a SOAP API with specific authentication and operation patterns. Deviating from documented interfaces will cause integration failures and security vulnerabilities.

### VII. Modern JavaScript Standards (NON-NEGOTIABLE)

All code MUST use ES modules (ESM) syntax exclusively. CommonJS imports/exports are prohibited. All new files MUST be TypeScript (.ts/.tsx) with strict mode enabled. JavaScript files (.js/.jsx) are only permitted for legacy configuration that cannot be migrated. Package management MUST use bun for all operations including install, update, and script execution.

**Rationale**: ESM ensures better tree-shaking, static analysis, and future compatibility. TypeScript provides compile-time error detection and improved maintainability. Bun offers faster package management and build performance compared to npm/yarn.

## Security Requirements

All authentication flows MUST validate SOAP `loginguid` tokens before API requests. Session management MUST implement secure logout across all tabs using the `Logout` SOAP operation. CSRF protection required for all state-changing operations. Content Security Policy (CSP) headers enforced in deployment. SOAP authentication credentials (`systemname`, `username`, `Password`) MUST never be stored in client-side storage.

## Development Workflow

All PRs MUST pass TypeScript compilation, ESLint, Prettier, and component accessibility testing. Package management operations MUST use bun exclusively (bun install, bun update, bun run). New components require Storybook documentation. Breaking changes to booking interfaces require user acceptance testing. Security-related changes require additional review approval. All new code MUST be written in TypeScript with strict type checking enabled.

## Governance

This constitution supersedes all other development practices. All code reviews MUST verify compliance with security and performance principles. Feature complexity MUST be justified against user value for laundry booking workflows. Constitution amendments require documentation and migration plan for existing components.

**Version**: 1.2.0 | **Ratified**: 2025-09-21 | **Last Amended**: 2025-09-21
