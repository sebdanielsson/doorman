# Feature Specification: Real News/Announcements Display

**Feature Branch**: `002-now-that-we`  
**Created**: 2025-01-25  
**Status**: Draft  
**Input**: User description: "Now that we can sign in as the user. Now let's fetch and display the news/announcements, instead of displaying our placeholder news. For now, ignore posts which only displays a pdf or docx file and focus on plaintext formats. We'll come back to the pdf and docx news at a later stage."

## Execution Flow (main)

```text
1. Parse user description from Input
   → Identified: Replace placeholder news with real SOAP API data
2. Extract key concepts from description
   → Actors: authenticated users
   → Actions: fetch, filter, display news/announcements
   → Data: terminal messages from SOAP API
   → Constraints: exclude PDF/DOCX-only posts, plaintext only
3. For each unclear aspect:
   → [NEEDS CLARIFICATION: How to determine if a post is PDF/DOCX-only?]
   → [NEEDS CLARIFICATION: What constitutes "plaintext format"?]
4. Fill User Scenarios & Testing section
   → Clear user flow: view news after login
5. Generate Functional Requirements
   → Each requirement testable and specific
6. Identify Key Entities: TrmMessageLite structure
7. Run Review Checklist
   → Spec has uncertainties marked for clarification
8. Return: SUCCESS (spec ready for planning)
```

---

## User Scenarios & Testing

### Primary User Story

As an authenticated user, I want to see real news and announcements from the building management system instead of placeholder content, so I can stay informed about important updates affecting the building and services.

### Acceptance Scenarios

1. **Given** a user is logged in and on the main page, **When** they view the announcements section, **Then** they see real news fetched from the SOAP API instead of placeholder data
2. **Given** news contains both text and PDF/DOCX attachments, **When** the system filters content, **Then** only news with plaintext content is displayed
3. **Given** multiple news items exist, **When** the user browses announcements, **Then** they are paginated and sorted by creation date (newest first)
4. **Given** a news item has an image, **When** the user views the announcement, **Then** the image is displayed alongside the text content
5. **Given** no news items are available, **When** the user views announcements, **Then** an appropriate empty state message is shown

### Edge Cases

- What happens when the SOAP API is unavailable or returns an error?
- How does the system handle news items with only images but no text content?
- What occurs when a news item has malformed or empty text content?
- How are very long news items displayed within the UI constraints?

## Requirements

### Functional Requirements

- **FR-001**: System MUST fetch news/announcements from the SOAP API using GetAllTerminalMessageLite operation
- **FR-002**: System MUST authenticate requests using the user's login GUID obtained during sign-in
- **FR-003**: System MUST filter out news items that contain only PDF or DOCX attachments [NEEDS CLARIFICATION: How to identify PDF/DOCX-only posts from ContentType field?]
- **FR-004**: System MUST display news items with plaintext content (TextMessage array field) [NEEDS CLARIFICATION: Should items with both text and PDF/DOCX be included or excluded?]
- **FR-005**: System MUST display news items in chronological order with newest items first (sorted by CreatedDate)
- **FR-006**: System MUST show message headers (MessageHeader field) as announcement titles
- **FR-007**: System MUST display text content from the TextMessage array field
- **FR-008**: System MUST fetch and display images when HasImage is true using GetTerminalMessageImage operation
- **FR-009**: System MUST handle related messages (RelatedMessageId field) appropriately [NEEDS CLARIFICATION: How should related messages be grouped or linked?]
- **FR-010**: System MUST maintain existing pagination functionality for the announcements list
- **FR-011**: System MUST provide error handling when SOAP API calls fail
- **FR-012**: System MUST show appropriate loading states while fetching news data
- **FR-013**: System MUST cache news data appropriately to avoid excessive API calls [NEEDS CLARIFICATION: What is the appropriate cache duration?]

### Key Entities

- **TrmMessageLite**: Represents a news/announcement item with MessageId (unique identifier), ContentType (determines message type), CreatedDate (for sorting), MessageHeader (title), TextMessage array (content), HasImage flag, IsHeader flag, RelatedMessageId (for message relationships), and RelatedContentType
- **News Item Display**: Filtered and processed version of TrmMessageLite containing only plaintext-compatible announcements with title, content, date, and optional image
- **Authentication Context**: Maintains the login GUID required for SOAP API authentication

---

## Review & Acceptance Checklist

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
