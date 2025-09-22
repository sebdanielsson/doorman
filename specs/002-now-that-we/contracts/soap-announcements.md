# SOAP Announcements Contract

**Service**: VisionMobile SOAP 1.1 Web Service  
**Endpoint**: `https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx`  
**Authentication**: loginguid (obtained from Login operation)

## GetAllTerminalMessageLite Operation

### Request Contract

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetAllTerminalMessageLite`

**Request Body**:

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetAllTerminalMessageLite xmlns="http://www.rco.se/Api/Mobile">
      <loginguid>{USER_LOGIN_GUID}</loginguid>
    </GetAllTerminalMessageLite>
  </soap:Body>
</soap:Envelope>
```

**Parameters**:

- `loginguid` (string, required): Valid authentication token from Login operation

### Response Contract

**Success Response**:

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetAllTerminalMessageLiteResponse xmlns="http://www.rco.se/Api/Mobile">
      <GetAllTerminalMessageLiteResult>
        <TrmMessageLite>
          <MessageId>1</MessageId>
          <ContentType>1</ContentType>
          <CreatedDate>2025-01-25T10:30:00</CreatedDate>
          <MessageHeader>Building Maintenance Notice</MessageHeader>
          <RelatedMessageId>0</RelatedMessageId>
          <TextMessage>
            <string>The laundry room will be closed for maintenance</string>
            <string>on Saturday from 9:00 AM to 2:00 PM.</string>
          </TextMessage>
          <HasImage>true</HasImage>
          <IsHeader>false</IsHeader>
          <RelatedContentType>0</RelatedContentType>
        </TrmMessageLite>
        <!-- Additional TrmMessageLite entries... -->
      </GetAllTerminalMessageLiteResult>
    </GetAllTerminalMessageLiteResponse>
  </soap:Body>
</soap:Envelope>
```

**Error Response** (Authentication failure):

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Client</faultcode>
      <faultstring>Invalid login GUID</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>
```

### TypeScript Interface

```typescript
interface GetAllTerminalMessageLiteRequest {
  loginguid: string;
}

interface GetAllTerminalMessageLiteResponse {
  GetAllTerminalMessageLiteResult: TrmMessageLite[];
}

interface TrmMessageLite {
  MessageId: number;
  ContentType: number;
  CreatedDate: string; // ISO date string
  MessageHeader: string;
  RelatedMessageId: number;
  TextMessage: string[];
  HasImage: boolean;
  IsHeader: boolean;
  RelatedContentType: number;
}
```

## GetTerminalMessageImage Operation

### Request Contract

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetTerminalMessageImage`

**Request Body**:

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetTerminalMessageImage xmlns="http://www.rco.se/Api/Mobile">
      <loginguid>{USER_LOGIN_GUID}</loginguid>
      <messageId>{MESSAGE_ID}</messageId>
      <isHeaderImage>false</isHeaderImage>
    </GetTerminalMessageImage>
  </soap:Body>
</soap:Envelope>
```

**Parameters**:

- `loginguid` (string, required): Valid authentication token
- `messageId` (int, required): ID of the message with image
- `isHeaderImage` (boolean, required): Whether to fetch header image (typically false)

### Response Contract

**Success Response**:

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetTerminalMessageImageResponse xmlns="http://www.rco.se/Api/Mobile">
      <GetTerminalMessageImageResult>iVBORw0KGgoAAAANSUhEUgAA...</GetTerminalMessageImageResult>
    </GetTerminalMessageImageResponse>
  </soap:Body>
</soap:Envelope>
```

**Error Response** (No image found):

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>Image not found for message ID</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>
```

### TypeScript Interface

```typescript
interface GetTerminalMessageImageRequest {
  loginguid: string;
  messageId: number;
  isHeaderImage: boolean;
}

interface GetTerminalMessageImageResponse {
  GetTerminalMessageImageResult: string; // Base64 encoded image
}
```

## Error Handling Patterns

### Authentication Errors

- **Fault Code**: `soap:Client`
- **Common Messages**: "Invalid login GUID", "Session expired"
- **Client Action**: Redirect to login, clear cache

### Server Errors

- **Fault Code**: `soap:Server`
- **Common Messages**: "Service unavailable", "Database error"
- **Client Action**: Show error message, retry with exponential backoff

### Network Errors

- **Symptoms**: Connection timeout, DNS failure
- **Client Action**: Show offline message, use cached data if available

## Rate Limiting

**Assumptions** (to be validated during testing):

- Max 10 requests per minute per authenticated user
- Image requests count separately from message list requests
- No batch operations available

## Testing Scenarios

### Happy Path

1. Valid authentication → Success response with message array
2. Message with HasImage=true → Image fetch returns Base64 data
3. Empty message list → Success response with empty array

### Error Cases

1. Invalid loginguid → SOAP fault response
2. Non-existent messageId for image → SOAP fault
3. Network timeout → Connection error
4. Malformed SOAP response → Parsing error

### Edge Cases

1. Very long TextMessage arrays (>1000 characters per string)
2. Special characters in MessageHeader (HTML entities, Unicode)
3. Future dates in CreatedDate field
4. Circular references in RelatedMessageId
