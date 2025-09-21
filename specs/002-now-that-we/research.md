# Research: Real News/Announcements Display

**Generated**: 2025-01-25  
**Phase**: 0 - Research & Requirements Resolution  
**Input**: Feature specification analysis with NEEDS CLARIFICATION items

## Research Questions & Resolutions

### 1. How to identify PDF/DOCX-only posts from ContentType field?

**Decision**: Use ContentType field analysis combined with TextMessage array inspection  
**Rationale**: Based on SOAP API documentation, ContentType is an integer field that determines message type. Posts with only PDF/DOCX attachments will have:

- ContentType indicating attachment-only content (likely specific integer values)
- Empty or minimal TextMessage array
- May have RelatedContentType indicating PDF/DOCX format

**Implementation Approach**:

- Filter messages where TextMessage array is empty or contains only whitespace
- Consider ContentType values during testing to identify patterns
- Use HasImage flag to distinguish image vs document attachments

**Alternatives considered**:

- Parsing message content for file extensions (unreliable)
- Server-side content analysis (overly complex)

### 2. What constitutes "plaintext format"?

**Decision**: Messages with non-empty TextMessage array content  
**Rationale**: According to the SOAP API spec, TrmMessageLite includes a TextMessage array field containing the actual text content. Plaintext format means:

- TextMessage array has at least one non-empty string
- Content is readable text (not binary data or file references)
- May include HTML formatting but still human-readable

**Implementation Approach**:

- Filter for messages where TextMessage.length > 0
- Filter out messages where all TextMessage entries are empty/whitespace
- Display TextMessage content as-is (may need HTML sanitization)

**Alternatives considered**:

- Complex content-type parsing (unnecessary given API structure)
- Converting PDF/DOCX to text (out of scope for this phase)

### 3. Should items with both text and PDF/DOCX be included or excluded?

**Decision**: Include items with both text content and attachments  
**Rationale**: The user requirement is to "ignore posts which only displays a pdf or docx file". Items with both text and attachments provide value to users as they can read the text content immediately.

**Implementation Approach**:

- Include messages with non-empty TextMessage array regardless of attachments
- Display text content prominently
- Consider showing attachment indicators in future iterations

**Alternatives considered**:

- Exclude all items with any attachments (too restrictive)
- Complex attachment analysis (over-engineering)

### 4. How should related messages be grouped or linked?

**Decision**: Display related messages as individual items with visual indicators  
**Rationale**: RelatedMessageId field suggests message threading/replies. For initial implementation:

- Show each message individually in chronological order
- Add visual indicator (indent, border, icon) for related messages
- Maintain simple flat list structure for pagination compatibility

**Implementation Approach**:

- Sort all messages by CreatedDate descending
- Group related messages visually without complex nesting
- Use RelatedMessageId to add visual connection indicators

**Alternatives considered**:

- Complex threaded view (scope creep)
- Ignoring relationships (loses user context)
- Nested accordion structure (conflicts with pagination)

### 5. What is the appropriate cache duration?

**Decision**: 5-minute client-side cache with background refresh  
**Rationale**: News/announcements change infrequently but users expect recent updates:

- 5 minutes balances freshness with performance
- Background refresh prevents perceived loading delays
- Respects SOAP API rate limits

**Implementation Approach**:

- Use React Query or SWR for automatic caching
- Stale-while-revalidate pattern for background updates
- Manual refresh option for users

**Alternatives considered**:

- No caching (poor performance)
- Long-term caching (stale content)
- Server-side caching only (doesn't help UX)

## Technology Decisions

### SOAP Client Extension

**Decision**: Extend existing lib/soap-client.ts with news operations  
**Rationale**: Reuse established authentication and error handling patterns

**Required Operations**:

- GetAllTerminalMessageLite: Fetch news list
- GetTerminalMessageImage: Fetch message images when HasImage=true

### API Route Structure

**Decision**: Create dedicated announcement API routes  
**Rationale**: Maintain existing CORS proxy pattern from authentication implementation

**Routes**:

- `/api/announcements`: GET - fetch filtered news list
- `/api/announcements/[messageId]/image`: GET - fetch message image

### Data Filtering Strategy

**Decision**: Server-side filtering in API routes  
**Rationale**:

- Reduces client bandwidth usage
- Consistent filtering logic
- Easier testing and debugging

### Component Architecture

**Decision**: Enhance existing announcements.tsx component  
**Rationale**: Maintain existing pagination and UI patterns, minimize breaking changes

**Changes Required**:

- Replace static data with API calls
- Add loading/error states
- Support image display
- Maintain responsive design

## Performance Considerations

### Loading Strategy

**Decision**: Progressive loading with skeleton states  
**Rationale**: Meets constitutional 2-second load requirement

**Approach**:

- Show skeleton UI immediately
- Load text content first
- Lazy load images as needed
- Implement virtual scrolling if >50 items

### Error Handling

**Decision**: Graceful degradation with fallback content  
**Rationale**: Progressive enhancement constitutional requirement

**Approach**:

- Show cached content if API fails
- Friendly error messages
- Retry mechanisms for temporary failures
- Fallback to placeholder content if all else fails

## Security Considerations

### Authentication

**Decision**: Reuse existing loginguid authentication flow  
**Rationale**: Proven secure pattern already implemented

### Data Sanitization

**Decision**: Sanitize HTML content from TextMessage array  
**Rationale**: Prevent XSS attacks from malicious content

**Implementation**: Use DOMPurify or similar for HTML sanitization

## Research Validation

✅ All NEEDS CLARIFICATION items resolved with clear decisions  
✅ Technology choices align with existing codebase patterns  
✅ Performance approach meets constitutional requirements  
✅ Security considerations documented  
✅ Implementation approach is feasible within project constraints

**Next Phase**: Design contracts and data models based on research decisions
