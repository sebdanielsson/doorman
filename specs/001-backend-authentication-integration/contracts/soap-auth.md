# SOAP Authentication Contracts

## Login Operation

**Operation**: Login  
**SOAP Action**: `http://www.rco.se/Api/Mobile/Login`  
**Endpoint**: User-provided SOAP endpoint URL (e.g., `https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx`)

### Request Schema

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Login xmlns="http://www.rco.se/Api/Mobile">
      <systemname xsi:type="xsd:string">string</systemname>
      <username xsi:type="xsd:string">string</username>
      <Password xsi:type="xsd:string">string</Password>
      <timeout xsi:type="xsd:int">int</timeout>
    </Login>
  </soap:Body>
</soap:Envelope>
```

### Request Parameters

- **systemname** (string, auto-derived): Extracted from URL path (e.g., "S0144BrfAsen" from "/S0144BrfAsen/api/mobile/visionmobile.asmx")
- **username** (string, user-provided): Apartment number (3-digit format)  
- **Password** (string, required): User password  
- **timeout** (int, required): Session timeout in minutes (default: 1200 to match iOS app behavior)

### Success Response Schema

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <LoginResponse xmlns="http://www.rco.se/Api/Mobile">
      <LoginResult>string</LoginResult>
    </LoginResponse>
  </soap:Body>
</soap:Envelope>
```

### Success Response Fields

- **LoginResult** (string): The `loginguid` token for subsequent authenticated requests

### Error Response Schema

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>string</faultcode>
      <faultstring>string</faultstring>
      <detail>string</detail>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>
```

### HTTP Headers

- **Content-Type**: `text/xml; charset=utf-8`
- **SOAPAction**: `"http://www.rco.se/Api/Mobile/Login"`

---

## Logout Operation

**Operation**: Logout  
**SOAP Action**: `http://www.rco.se/Api/Mobile/Logout`  
**Endpoint**: `https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx`

### Request Schema

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Logout xmlns="http://www.rco.se/Api/Mobile/">
      <loginguid>string</loginguid>
    </Logout>
  </soap:Body>
</soap:Envelope>
```

### Request Parameters

- **loginguid** (string, required): Authentication token from Login operation

### Success Response Schema

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <LogoutResponse xmlns="http://www.rco.se/Api/Mobile/">
      <LogoutResult>string</LogoutResult>
    </LogoutResponse>
  </soap:Body>
</soap:Envelope>
```

### Success Response Fields

- **LogoutResult** (string): Confirmation message or status

### HTTP Headers

- **Content-Type**: `text/xml; charset=utf-8`
- **SOAPAction**: `"http://www.rco.se/Api/Mobile/Logout"`
