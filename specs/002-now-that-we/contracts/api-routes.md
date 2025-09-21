# API Routes Contract

**Base URL**: `/api/announcements`  
**Authentication**: HttpOnly cookies (loginguid)  
**Pattern**: Next.js API Routes as SOAP proxy

## GET /api/announcements

### Purpose

Fetch filtered list of announcements with plaintext content

### Request

**Method**: `GET`  
**URL**: `/api/announcements`  
**Query Parameters**:

- `page` (optional, number): Page number (default: 1)
- `pageSize` (optional, number): Items per page (default: 10, max: 50)

**Headers**:

- `Cookie`: HttpOnly cookie containing authentication

**Example Request**:

```http
GET /api/announcements?page=1&pageSize=10 HTTP/1.1
Host: localhost:3000
Cookie: auth-token=eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "123",
        "title": "Building Maintenance Notice",
        "content": [
          "The laundry room will be closed for maintenance",
          "on Saturday from 9:00 AM to 2:00 PM."
        ],
        "createdDate": "2025-01-25T10:30:00.000Z",
        "hasImage": true,
        "isRelated": false
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalCount": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "lastFetched": "2025-01-25T15:45:30.000Z"
  }
}
```

**Error Response** (401 Unauthorized):

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": "Invalid or expired login session"
  }
}
```

**Error Response** (500 Internal Server Error):

```json
{
  "success": false,
  "error": {
    "code": "SOAP_ERROR",
    "message": "Failed to fetch announcements",
    "details": "SOAP service unavailable"
  }
}
```

### TypeScript Interface

```typescript
interface GetAnnouncementsRequest {
  page?: number;
  pageSize?: number;
}

interface GetAnnouncementsResponse {
  success: boolean;
  data?: {
    items: AnnouncementItem[];
    pagination: PaginationInfo;
    lastFetched: string;
  };
  error?: ApiError;
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string[];
  createdDate: string; // ISO string
  hasImage: boolean;
  isRelated: boolean;
  relatedToId?: string;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiError {
  code: string;
  message: string;
  details?: string;
}
```

## GET /api/announcements/[messageId]/image

### Purpose

Fetch image for specific announcement

### Request

**Method**: `GET`  
**URL**: `/api/announcements/{messageId}/image`  
**Path Parameters**:

- `messageId` (required, string): Announcement ID

**Headers**:

- `Cookie`: HttpOnly cookie containing authentication

**Example Request**:

```http
GET /api/announcements/123/image HTTP/1.1
Host: localhost:3000
Cookie: auth-token=eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Response

**Success Response** (200 OK):

```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 45234
Cache-Control: public, max-age=3600

[Binary image data]
```

**Error Response** (404 Not Found):

```json
{
  "success": false,
  "error": {
    "code": "IMAGE_NOT_FOUND",
    "message": "Image not found for announcement",
    "details": "No image associated with message ID 123"
  }
}
```

**Error Response** (401 Unauthorized):

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": "Invalid or expired login session"
  }
}
```

### TypeScript Interface

```typescript
interface GetImageRequest {
  messageId: string;
}

// Success response is binary image data
// Error response follows ApiError interface
```

## Error Codes

### Client Errors (4xx)

- `UNAUTHORIZED` (401): Invalid/expired authentication
- `FORBIDDEN` (403): Valid auth but insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request parameters

### Server Errors (5xx)

- `SOAP_ERROR` (500): SOAP API communication failure
- `INTERNAL_ERROR` (500): Server-side processing error
- `SERVICE_UNAVAILABLE` (503): Downstream service unavailable

## Caching Headers

### Announcements List

```http
Cache-Control: private, max-age=300, stale-while-revalidate=300
ETag: "announcements-{hash}"
```

### Images

```http
Cache-Control: public, max-age=3600, immutable
ETag: "image-{messageId}-{hash}"
```

## Rate Limiting

**Policy**: 60 requests per minute per authenticated user  
**Headers**:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642781400
```

**Exceeded Response** (429 Too Many Requests):

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": "Rate limit: 60 requests per minute"
  }
}
```

## Security Considerations

### Authentication Flow

1. Client makes request with HttpOnly cookie
2. API route extracts loginguid from secure cookie
3. API route makes SOAP request with loginguid
4. Response filtered and sanitized before return

### Data Sanitization

- HTML content in MessageHeader sanitized with DOMPurify
- TextMessage content sanitized to prevent XSS
- File paths and URLs validated before processing

### CORS Policy

```javascript
// Next.js API routes automatically handle CORS
// No additional configuration needed for same-origin requests
```

## Testing Contracts

### Unit Tests

- Request validation (invalid parameters)
- Response transformation (SOAP → JSON)
- Error handling (SOAP faults)
- Authentication validation

### Integration Tests

- End-to-end announcement fetching
- Image loading with authentication
- Error scenarios (network failures)
- Rate limiting behavior

### Contract Tests

- SOAP request/response validation
- API response schema validation
- Error response consistency
