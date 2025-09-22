# Data Model: Real News/Announcements Display

**Generated**: 2025-01-25  
**Phase**: 1 - Design & Contracts  
**Input**: Feature specification + research.md decisions

## Core Entities

### TrmMessageLite (SOAP API Response)

**Source**: SOAP API GetAllTerminalMessageLite operation  
**Purpose**: Raw news/announcement data from building management system

```typescript
interface TrmMessageLite {
  MessageId: number; // Unique identifier
  ContentType: number; // Determines message type/format
  CreatedDate: string; // ISO date string from SOAP (dateTime)
  MessageHeader: string; // Title/subject of the announcement
  RelatedMessageId: number; // Reference to parent/related message
  TextMessage: string[]; // Array of text content lines
  HasImage: boolean; // Indicates if image attachment exists
  IsHeader: boolean; // Indicates if this is a header message
  RelatedContentType: number; // Content type of related message
}
```

**Validation Rules**:

- MessageId MUST be positive integer
- CreatedDate MUST be valid ISO date string
- TextMessage array MAY be empty (filtered out)
- RelatedMessageId of 0 indicates no relationship

**State Transitions**: Read-only data (no state changes)

### AnnouncementItem (Display Model)

**Source**: Filtered and transformed TrmMessageLite  
**Purpose**: Client-side representation for UI display

```typescript
interface AnnouncementItem {
  id: string; // String version of MessageId
  title: string; // MessageHeader, sanitized
  content: string[]; // Filtered TextMessage array
  createdDate: Date; // Parsed CreatedDate as Date object
  hasImage: boolean; // HasImage flag
  imageUrl?: string; // Lazy-loaded image URL if hasImage=true
  isRelated: boolean; // true if RelatedMessageId > 0
  relatedToId?: string; // Parent message ID if related
}
```

**Validation Rules**:

- id MUST be non-empty string
- title MUST be sanitized HTML
- content array MUST have at least one non-empty string
- createdDate MUST be valid Date object
- imageUrl MUST be valid URL when present

**Transformation Logic**:

```typescript
// Pseudo-code for TrmMessageLite → AnnouncementItem
function transformMessage(soap: TrmMessageLite): AnnouncementItem | null {
  // Filter: Exclude if no text content
  if (!soap.TextMessage || soap.TextMessage.every((text) => !text.trim())) {
    return null; // Exclude PDF/DOCX-only posts
  }

  return {
    id: soap.MessageId.toString(),
    title: sanitizeHtml(soap.MessageHeader),
    content: soap.TextMessage.filter((text) => text.trim()),
    createdDate: new Date(soap.CreatedDate),
    hasImage: soap.HasImage,
    isRelated: soap.RelatedMessageId > 0,
    relatedToId: soap.RelatedMessageId > 0 ? soap.RelatedMessageId.toString() : undefined,
  };
}
```

### AnnouncementsList (Collection Model)

**Source**: Array of AnnouncementItem  
**Purpose**: Paginated list with metadata for UI

```typescript
interface AnnouncementsList {
  items: AnnouncementItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  lastFetched: Date;
  error?: string;
}
```

**Validation Rules**:

- items array MUST be sorted by createdDate descending
- page MUST be positive integer starting from 1
- pageSize MUST be positive integer (default: 10)
- totalCount MUST match actual filtered count
- lastFetched MUST be recent (within cache duration)

**Business Rules**:

- Related messages appear in chronological order (not nested)
- Images loaded lazy after text content
- Empty states handled gracefully

## Data Relationships

### Message Threading

```
Message A (MessageId: 1, RelatedMessageId: 0)     // Root message
├── Message B (MessageId: 2, RelatedMessageId: 1) // Reply to A
└── Message C (MessageId: 3, RelatedMessageId: 1) // Also reply to A
```

**Display Strategy**: Show all messages in flat chronological order with visual indicators for relationships

### Image Associations

```
AnnouncementItem.hasImage = true
├── AnnouncementItem.imageUrl = undefined (initial state)
└── AnnouncementItem.imageUrl = "/api/announcements/{id}/image" (after lazy load)
```

## API Contracts

### News Fetching Contract

**Operation**: GetAllTerminalMessageLite  
**Authentication**: Requires valid loginguid from user session  
**Response**: Array of TrmMessageLite objects  
**Error Handling**: SOAP fault → graceful degradation

### Image Fetching Contract

**Operation**: GetTerminalMessageImage  
**Authentication**: Requires valid loginguid  
**Input**: messageId (number), isHeaderImage (boolean)  
**Response**: Base64 encoded image string  
**Error Handling**: Missing image → show placeholder

## Caching Strategy

### Cache Key Structure

```typescript
interface CacheEntry {
  key: `announcements:${userId}:${timestamp}`;
  data: AnnouncementsList;
  expiry: Date; // 5 minutes from fetch
  staleWhileRevalidate: boolean;
}
```

### Cache Invalidation

- Manual refresh action
- Authentication state change
- 5-minute automatic expiry
- SOAP API errors clear cache

## Error States

### Data Validation Errors

- Invalid SOAP response structure
- Malformed date strings
- Empty required fields

### Network Errors

- SOAP API unavailable
- Authentication failures
- Timeout errors

### Display Errors

- Image loading failures
- HTML sanitization issues
- Pagination calculation errors

**Error Recovery**: Graceful degradation to cached data or placeholder content per constitutional progressive enhancement requirement

## Performance Constraints

### Memory Limits

- Maximum 100 announcements in memory
- Lazy image loading to reduce memory footprint
- Efficient React rendering with keys

### Network Efficiency

- Batch image requests when possible
- Compress SOAP responses where supported
- Use ETags for HTTP caching on API routes

### Render Performance

- Virtual scrolling for >20 items
- Memoized components to prevent unnecessary re-renders
- Optimistic UI updates for better perceived performance

**Validation**: All constraints align with constitutional 2-second load requirement and WCAG 2.1 AA accessibility standards
