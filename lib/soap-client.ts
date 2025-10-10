/**
 * SOAP Client for RCO API Authentication
 * Based on contracts/soap-auth.md and research.md decisions
 */

import type {
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  SoapResponse,
  SoapFault,
  SoapHeaders,
  TrmMessageLite,
  GetAllTerminalMessageLiteResponse,
  GetTerminalMessageImageResponse,
  GetOneTerminalMessageLiteResponse,
  BookUserBooking,
  GetBookUserBookingsResponse,
} from '@/types/soap';
import type { LoginCredentials } from '@/types/auth';

/**
 * Extract systemname from server URL path
 * E.g., "https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx" → "S0144BrfAsen"
 */
export function extractSystemnameFromUrl(serverUrl: string): string {
  try {
    const url = new URL(serverUrl);
    const pathSegments = url.pathname.split('/').filter((segment) => segment.length > 0);

    // Find the segment before "api/mobile/visionmobile.asmx"
    const apiIndex = pathSegments.findIndex((segment) => segment === 'api');
    if (apiIndex > 0) {
      return pathSegments[apiIndex - 1];
    }

    // Fallback: use the first non-empty path segment
    if (pathSegments.length > 0) {
      return pathSegments[0];
    }

    throw new Error('Unable to extract systemname from URL path');
  } catch (error) {
    throw new Error(
      `Invalid server URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Format login credentials into SOAP XML request with proper xsi:type specifications
 */
export function formatLoginRequest(credentials: LoginCredentials, serverUrl: string): string {
  const systemname = extractSystemnameFromUrl(serverUrl);

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Login xmlns="http://www.rco.se/Api/Mobile">
      <systemname xsi:type="xsd:string">${escapeXml(systemname)}</systemname>
      <username xsi:type="xsd:string">${escapeXml(credentials.username)}</username>
      <Password xsi:type="xsd:string">${escapeXml(credentials.password)}</Password>
      <timeout xsi:type="xsd:int">${credentials.timeout}</timeout>
    </Login>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * Format GetAllTerminalMessageLite request into SOAP XML
 */
export function formatGetAllTerminalMessageLiteRequest(loginguid: string): string {
  if (!loginguid || loginguid.trim() === '') {
    throw new Error('loginguid is required');
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetAllTerminalMessageLite xmlns="http://www.rco.se/Api/Mobile">
      <loginguid xsi:type="xsd:string">${escapeXml(loginguid)}</loginguid>
    </GetAllTerminalMessageLite>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * Format GetOneTerminalMessageLite request into SOAP XML
 */
export function formatGetOneTerminalMessageLiteRequest(
  loginguid: string,
  messageId: number,
): string {
  if (!loginguid || loginguid.trim() === '') {
    throw new Error('loginguid is required');
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetOneTerminalMessageLite xmlns="http://www.rco.se/Api/Mobile">
      <loginguid xsi:type="xsd:string">${escapeXml(loginguid)}</loginguid>
      <messageId xsi:type="xsd:int">${messageId}</messageId>
    </GetOneTerminalMessageLite>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * Get headers for GetOneTerminalMessageLite SOAP request
 */
export function getGetOneTerminalMessageLiteHeaders(): SoapHeaders {
  return {
    'Content-Type': 'text/xml; charset=utf-8',
    SOAPAction: '"http://www.rco.se/Api/Mobile/GetOneTerminalMessageLite"',
  };
}

/**
 * Parse GetOneTerminalMessageLite SOAP response XML
 */
export function parseGetOneTerminalMessageLiteResponse(
  xml: string,
): SoapResponse<GetOneTerminalMessageLiteResponse> {
  try {
    console.debug('parseGetOneTerminalMessageLiteResponse - incoming XML length:', xml.length);
    const fault = parseSoapFault(xml);
    if (fault) {
      return { success: false, fault, rawResponse: xml };
    }

    // Try to find a TrmMessageLite element first (namespaced or not)
    let messageXml: string | null = null;
    const trmMatch = xml.match(
      /<(?:(?:\w+:)?)TrmMessageLite[\s\S]*?<\/(?:(?:\w+:)?)TrmMessageLite>/i,
    );
    if (trmMatch) {
      messageXml = trmMatch[0];
    } else {
      // Fallback: find GetOneTerminalMessageLiteResult wrapper and treat its inner XML as the message
      const resultMatch = xml.match(
        /<(?:(?:\w+:)?)GetOneTerminalMessageLiteResult[\s\S]*?<\/(?:(?:\w+:)?)GetOneTerminalMessageLiteResult>/i,
      );
      if (resultMatch) {
        // Strip the outer tag and use inner content
        const outer = resultMatch[0];
        // remove the opening tag
        const inner = outer
          .replace(/^<(?:(?:\w+:)?)GetOneTerminalMessageLiteResult[^>]*>/i, '')
          .replace(/<\/(?:(?:\w+:)?)GetOneTerminalMessageLiteResult>$/i, '');
        messageXml = inner;
      }
    }

    if (!messageXml) {
      // No message found, return null result
      return {
        success: true,
        data: { GetOneTerminalMessageLiteResult: null },
        rawResponse: xml,
      };
    }

    const messageId = extractXmlValue(messageXml, 'MessageId');
    const contentType = extractXmlValue(messageXml, 'ContentType');
    const createdDate = extractXmlValue(messageXml, 'CreatedDate');
    const messageHeader = extractXmlValue(messageXml, 'MessageHeader');
    const relatedMessageId = extractXmlValue(messageXml, 'RelatedMessageId');
    const hasImage = extractXmlValue(messageXml, 'HasImage');
    const isHeader = extractXmlValue(messageXml, 'IsHeader');
    const relatedContentType = extractXmlValue(messageXml, 'RelatedContentType');

    const textMessageMatches = messageXml.matchAll(/<string>([^<]*)<\/string>/g);
    const textMessages: string[] = [];
    for (const m of textMessageMatches) {
      textMessages.push(m[1] || '');
    }

    const message = {
      MessageId: parseInt(messageId || '0', 10),
      ContentType: parseInt(contentType || '0', 10),
      CreatedDate: createdDate || '',
      MessageHeader: messageHeader || '',
      RelatedMessageId: parseInt(relatedMessageId || '0', 10),
      TextMessage: textMessages,
      HasImage: hasImage === 'true',
      IsHeader: isHeader === 'true',
      RelatedContentType: parseInt(relatedContentType || '0', 10),
    };

    console.debug('parseGetOneTerminalMessageLiteResponse - parsed message:', {
      MessageId: message.MessageId,
      TextMessageCount: message.TextMessage.length,
      MessageHeader: message.MessageHeader,
      HasImage: message.HasImage,
    });

    return {
      success: true,
      data: { GetOneTerminalMessageLiteResult: message },
      rawResponse: xml,
    };
  } catch (error) {
    return {
      success: false,
      fault: {
        faultCode: 'Client',
        faultString: 'Failed to parse GetOneTerminalMessageLite response',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      rawResponse: xml,
    };
  }
}

/**
 * Make GetOneTerminalMessageLite SOAP request
 */
export async function getOneTerminalMessageLite(
  loginguid: string,
  messageId: number,
  serverUrl?: string,
): Promise<SoapResponse<GetOneTerminalMessageLiteResponse>> {
  if (!loginguid || loginguid.trim() === '') {
    throw new Error('loginguid is required');
  }

  const endpoint = serverUrl || process.env.NEXT_PUBLIC_SOAP_ENDPOINT || '';
  if (!endpoint) {
    throw new Error('SOAP endpoint is required');
  }

  try {
    const xml = formatGetOneTerminalMessageLiteRequest(loginguid, messageId);
    const headers = getGetOneTerminalMessageLiteHeaders();
    console.debug('getOneTerminalMessageLite - POST', { endpoint, messageId });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: xml,
    });

    if (!response.ok) {
      return {
        success: false,
        fault: {
          faultCode: 'HTTP',
          faultString: `HTTP ${response.status}: ${response.statusText}`,
        },
        rawResponse: await response.text(),
      };
    }

    const responseXml = await response.text();
    console.debug('getOneTerminalMessageLite - response length:', responseXml.length);
    return parseGetOneTerminalMessageLiteResponse(responseXml);
  } catch (error) {
    return {
      success: false,
      fault: {
        faultCode: 'Client',
        faultString: 'Network error',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      rawResponse: '',
    };
  }
}

/**
 * Parse GetAllTerminalMessageLite SOAP response XML
 */
export function parseGetAllTerminalMessageLiteResponse(
  xml: string,
): SoapResponse<GetAllTerminalMessageLiteResponse> {
  try {
    const fault = parseSoapFault(xml);
    if (fault) {
      return {
        success: false,
        fault,
        rawResponse: xml,
      };
    }

    // Extract the result array from the response
    const messages: TrmMessageLite[] = [];

    // Find all TrmMessageLite elements in the response
    const messageMatches = xml.matchAll(/<TrmMessageLite>[\s\S]*?<\/TrmMessageLite>/g);

    for (const match of messageMatches) {
      const messageXml = match[0];

      try {
        const messageId = extractXmlValue(messageXml, 'MessageId');
        const contentType = extractXmlValue(messageXml, 'ContentType');
        const createdDate = extractXmlValue(messageXml, 'CreatedDate');
        const messageHeader = extractXmlValue(messageXml, 'MessageHeader');
        const relatedMessageId = extractXmlValue(messageXml, 'RelatedMessageId');
        const hasImage = extractXmlValue(messageXml, 'HasImage');
        const isHeader = extractXmlValue(messageXml, 'IsHeader');
        const relatedContentType = extractXmlValue(messageXml, 'RelatedContentType');

        // Extract TextMessage array
        // Extract TextMessage array: elements named <string> possibly with namespace prefix
        const textMessages: string[] = [];
        const stringRegex = /<(?:(?:\w+:)?)string\b[^>]*>([\s\S]*?)<\/(?:(?:\w+:)?)string>/gi;
        for (const m of messageXml.matchAll(stringRegex)) {
          let val = m[1] || '';
          const cdata = val.match(/<!\[CDATA\[([\s\S]*?)\]\]>/i);
          if (cdata) val = cdata[1];
          val = val.trim();
          if (val.length > 0) textMessages.push(val);
        }

        // Fallback: if none found, attempt to extract from a <TextMessage> element containing <string/> children or raw text
        if (textMessages.length === 0) {
          // Match a container element named TextMessage (namespace tolerant)
          const textMessageContainer = messageXml.match(
            /<(?:(?:\\w+:)?)TextMessage[\s\S]*?>([\s\S]*?)<\/(?:(?:\\w+:)?)TextMessage>/i,
          );
          if (textMessageContainer) {
            const inner = textMessageContainer[1];
            // Extract nested string elements
            for (const m of inner.matchAll(stringRegex)) {
              let val = m[1] || '';
              const cdata = val.match(/<!\[CDATA\[([\s\S]*?)\]\]>/i);
              if (cdata) val = cdata[1];
              val = val.trim();
              if (val.length > 0) textMessages.push(val);
            }

            // If still empty, use inner text nodes by stripping tags
            if (textMessages.length === 0) {
              const plain = inner.replace(/<[^>]*>/g, '').trim();
              if (plain.length > 0) textMessages.push(plain);
            }
          }
        }

        const message: TrmMessageLite = {
          MessageId: parseInt(messageId, 10),
          ContentType: parseInt(contentType, 10),
          CreatedDate: createdDate,
          MessageHeader: messageHeader,
          RelatedMessageId: parseInt(relatedMessageId, 10),
          TextMessage: textMessages,
          HasImage: hasImage === 'true',
          IsHeader: isHeader === 'true',
          RelatedContentType: parseInt(relatedContentType, 10),
        };

        messages.push(message);
      } catch (parseError) {
        console.error('Failed to parse message element:', parseError);
        // Continue parsing other messages
      }
    }

    return {
      success: true,
      data: {
        GetAllTerminalMessageLiteResult: messages,
      },
      rawResponse: xml,
    };
  } catch (error) {
    return {
      success: false,
      fault: {
        faultCode: 'Client',
        faultString: 'Failed to parse GetAllTerminalMessageLite response',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      rawResponse: xml,
    };
  }
}

/**
 * Get headers for GetAllTerminalMessageLite SOAP request
 */
export function getGetAllTerminalMessageLiteHeaders(): SoapHeaders {
  return {
    'Content-Type': 'text/xml; charset=utf-8',
    SOAPAction: '"http://www.rco.se/Api/Mobile/GetAllTerminalMessageLite"',
  };
}

/**
 * Make GetAllTerminalMessageLite SOAP request
 */
export async function getAllTerminalMessageLite(
  loginguid: string,
  serverUrl?: string,
): Promise<SoapResponse<GetAllTerminalMessageLiteResponse>> {
  if (!loginguid || loginguid.trim() === '') {
    throw new Error('loginguid is required');
  }

  const endpoint = serverUrl || process.env.NEXT_PUBLIC_SOAP_ENDPOINT || '';
  if (!endpoint) {
    throw new Error('SOAP endpoint is required');
  }

  try {
    const xml = formatGetAllTerminalMessageLiteRequest(loginguid);
    const headers = getGetAllTerminalMessageLiteHeaders();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: xml,
    });

    if (!response.ok) {
      return {
        success: false,
        fault: {
          faultCode: 'HTTP',
          faultString: `HTTP ${response.status}: ${response.statusText}`,
        },
        rawResponse: await response.text(),
      };
    }

    const responseXml = await response.text();
    return parseGetAllTerminalMessageLiteResponse(responseXml);
  } catch (error) {
    return {
      success: false,
      fault: {
        faultCode: 'Client',
        faultString: 'Network error',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      rawResponse: '',
    };
  }
}

/**
 * Extract XML element value safely
 */
function extractXmlValue(xml: string, elementName: string): string {
  // Match element with optional namespace prefix, capture inner content (including possible CDATA)
  const regex = new RegExp(
    `<(?:(?:\\w+:)?)${elementName}\\b[^>]*>([\\s\\S]*?)<\\/(?:(?:\\w+:)?)${elementName}>`,
    'i',
  );
  const match = xml.match(regex);
  if (!match) return '';
  let inner = match[1] || '';

  // Handle CDATA sections
  const cdataMatch = inner.match(/<!\[CDATA\[([\s\S]*?)\]\]>/i);
  if (cdataMatch) {
    inner = cdataMatch[1];
  }

  // Strip surrounding whitespace and any XML tags that may have been included
  inner = inner.trim();
  return inner;
}

/**
 * Format logout request into SOAP XML
 */
export function formatLogoutRequest(request: LogoutRequest): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Logout xmlns="http://www.rco.se/Api/Mobile/">
      <loginguid>${escapeXml(request.loginguid)}</loginguid>
    </Logout>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * Parse SOAP login response XML
 */
export function parseLoginResponse(xml: string): SoapResponse<LoginResponse> {
  try {
    const fault = parseSoapFault(xml);
    if (fault) {
      return {
        success: false,
        fault,
        rawResponse: xml,
      };
    }

    // Extract LoginResult using regex (simple XML parsing for this specific case)
    const loginResultMatch = xml.match(/<LoginResult>([^<]+)<\/LoginResult>/);
    if (!loginResultMatch) {
      throw new Error('Invalid login response format');
    }

    return {
      success: true,
      data: {
        LoginResult: loginResultMatch[1],
      },
      rawResponse: xml,
    };
  } catch (error) {
    return {
      success: false,
      fault: {
        faultCode: 'Client',
        faultString: 'Failed to parse response',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      rawResponse: xml,
    };
  }
}

/**
 * Parse SOAP logout response XML
 */
export function parseLogoutResponse(xml: string): SoapResponse<LogoutResponse> {
  try {
    const fault = parseSoapFault(xml);
    if (fault) {
      return {
        success: false,
        fault,
        rawResponse: xml,
      };
    }

    // Extract LogoutResult
    const logoutResultMatch = xml.match(/<LogoutResult>([^<]+)<\/LogoutResult>/);
    if (!logoutResultMatch) {
      throw new Error('Invalid logout response format');
    }

    // Convert string to boolean
    const logoutResult = logoutResultMatch[1] === 'true';

    return {
      success: true,
      data: {
        LogoutResult: logoutResult,
      },
      rawResponse: xml,
    };
  } catch (error) {
    return {
      success: false,
      fault: {
        faultCode: 'Client',
        faultString: 'Failed to parse response',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      rawResponse: xml,
    };
  }
}

/**
 * Get headers for SOAP login request
 */
export function getLoginHeaders(): SoapHeaders {
  return {
    'Content-Type': 'text/xml; charset=utf-8',
    SOAPAction: '"http://www.rco.se/Api/Mobile/Login"',
  };
}

/**
 * Get headers for SOAP logout request
 */
export function getLogoutHeaders(): SoapHeaders {
  return {
    'Content-Type': 'text/xml; charset=utf-8',
    SOAPAction: '"http://www.rco.se/Api/Mobile/Logout"',
  };
}

/**
 * Make SOAP login request to server
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const xml = formatLoginRequest(credentials, credentials.serverUrl);
  const headers = getLoginHeaders();

  try {
    const response = await fetch(credentials.serverUrl, {
      method: 'POST',
      headers,
      body: xml,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseXml = await response.text();
    const parsed = parseLoginResponse(responseXml);

    if (!parsed.success || !parsed.data) {
      const errorMsg = parsed.fault?.faultString || 'Login failed';
      throw new Error(errorMsg);
    }

    return parsed.data;
  } catch (error) {
    throw new Error(
      `SOAP Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Make SOAP logout request to server
 */
export async function logout(loginguid: string): Promise<LogoutResponse> {
  const request: LogoutRequest = { loginguid };
  const xml = formatLogoutRequest(request);
  const headers = getLogoutHeaders();

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_SOAP_ENDPOINT || '', {
      method: 'POST',
      headers,
      body: xml,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseXml = await response.text();
    const parsed = parseLogoutResponse(responseXml);

    if (!parsed.success || !parsed.data) {
      const errorMsg = parsed.fault?.faultString || 'Logout failed';
      throw new Error(errorMsg);
    }

    return parsed.data;
  } catch (error) {
    throw new Error(
      `SOAP Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Check if SOAP service is healthy
 */
export async function isHealthy(): Promise<boolean> {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_SOAP_ENDPOINT || '', {
      method: 'GET',
      headers: { Accept: 'text/html' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Format GetTerminalMessageImage request XML
 */
export function formatGetTerminalMessageImageRequest(
  loginguid: string,
  messageId: number,
  isHeaderImage: boolean,
): string {
  // Convert boolean to int to match iOS format (0 = false, 1 = true)
  const isHeaderImageInt = isHeaderImage ? 1 : 0;

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetTerminalMessageImage xmlns="http://www.rco.se/Api/Mobile">
      <messageId xsi:type="xsd:int">${messageId}</messageId>
      <loginguid xsi:type="xsd:string">${escapeXml(loginguid)}</loginguid>
      <isHeaderImage xsi:type="xsd:int">${isHeaderImageInt}</isHeaderImage>
    </GetTerminalMessageImage>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * Get SOAP headers for GetTerminalMessageImage operation
 */
export function getGetTerminalMessageImageHeaders(): SoapHeaders {
  return {
    'Content-Type': 'text/xml; charset=utf-8',
    SOAPAction: '"http://www.rco.se/Api/Mobile/GetTerminalMessageImage"',
  };
}

/**
 * Parse GetTerminalMessageImage response XML
 */
export function parseGetTerminalMessageImageResponse(
  xml: string,
): SoapResponse<GetTerminalMessageImageResponse> {
  try {
    const fault = parseSoapFault(xml);
    if (fault) {
      return {
        success: false,
        fault,
        rawResponse: xml,
      };
    }

    // Extract GetTerminalMessageImageResult - try multiple patterns
    let imageResultMatch = xml.match(
      /<GetTerminalMessageImageResult>([^<]*)<\/GetTerminalMessageImageResult>/,
    );

    // If the first pattern doesn't work, try with CDATA or different namespace
    if (!imageResultMatch) {
      imageResultMatch = xml.match(
        /<GetTerminalMessageImageResult><!\[CDATA\[([^\]]*)\]\]><\/GetTerminalMessageImageResult>/,
      );
    }

    // Try with namespace prefix
    if (!imageResultMatch) {
      imageResultMatch = xml.match(
        /<\w+:GetTerminalMessageImageResult[^>]*>([^<]*)<\/\w+:GetTerminalMessageImageResult>/,
      );
    }

    // Debug: Log the raw XML if we can't parse it
    if (!imageResultMatch) {
      console.log('DEBUG - Failed to parse image response XML:', xml);
      // Check if the result element exists but is empty
      if (xml.includes('GetTerminalMessageImageResult')) {
        console.log(
          'DEBUG - GetTerminalMessageImageResult element found but empty or unmatched pattern',
        );
        return {
          success: true,
          data: {
            GetTerminalMessageImageResult: '',
          },
          rawResponse: xml,
        };
      }

      // Check if this is an empty response (no image available)
      if (
        xml.includes('<GetTerminalMessageImageResponse') &&
        xml.includes('xmlns="http://www.rco.se/Api/Mobile"') &&
        xml.includes('/>')
      ) {
        console.log(
          'DEBUG - Empty GetTerminalMessageImageResponse - no image available for this message',
        );
        return {
          success: false,
          fault: {
            faultCode: 'NoImage',
            faultString: 'No image available',
            detail: 'This message does not have an associated image',
          },
          rawResponse: xml,
        };
      }

      throw new Error('Invalid GetTerminalMessageImage response format - no result element found');
    }

    const imageData = imageResultMatch[1] || '';
    console.debug(
      'parseGetTerminalMessageImageResponse - Extracted image data length:',
      imageData.length,
    );

    return {
      success: true,
      data: {
        GetTerminalMessageImageResult: imageData,
      },
      rawResponse: xml,
    };
  } catch (error) {
    console.log('DEBUG - Parse error:', error);
    return {
      success: false,
      fault: {
        faultCode: 'Client',
        faultString: 'Failed to parse response',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      rawResponse: xml,
    };
  }
}

/**
 * Get terminal message image from SOAP service
 */
export async function getTerminalMessageImage(
  soapEndpoint: string,
  loginguid: string,
  messageId: number,
  isHeaderImage: boolean = false,
): Promise<SoapResponse<GetTerminalMessageImageResponse>> {
  try {
    console.debug('getTerminalMessageImage - POST', { soapEndpoint, messageId, isHeaderImage });
    const requestXml = formatGetTerminalMessageImageRequest(loginguid, messageId, isHeaderImage);
    const headers = {
      ...getGetTerminalMessageImageHeaders(),
      'User-Agent': 'Mobile iOS client', // Match iOS app behavior
      'Accept-Encoding': '',
      'Cache-Control': 'no-cache',
    };

    const response = await fetch(soapEndpoint, {
      method: 'POST',
      headers,
      body: requestXml,
    });

    const xml = await response.text();

    console.debug('getTerminalMessageImage - response xml length:', xml.length);

    if (!response.ok) {
      return {
        success: false,
        fault: {
          faultCode: `HTTP_${response.status}`,
          faultString: response.statusText,
          detail: xml,
        },
        rawResponse: xml,
      };
    }

    return parseGetTerminalMessageImageResponse(xml);
  } catch (error) {
    return {
      success: false,
      fault: {
        faultCode: 'Network',
        faultString: 'Network error',
        detail: error instanceof Error ? error.message : 'Unknown network error',
      },
      rawResponse: '',
    };
  }
}

// Helper functions

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Parse SOAP fault from response XML
 */
function parseSoapFault(xml: string): SoapFault | null {
  if (!xml.includes('<soap:Fault>')) {
    return null;
  }

  try {
    const faultCodeMatch = xml.match(/<faultcode>([^<]+)<\/faultcode>/);
    const faultStringMatch = xml.match(/<faultstring>([^<]+)<\/faultstring>/);
    const detailMatch = xml.match(/<detail>([^<]+)<\/detail>/);

    return {
      faultCode: faultCodeMatch?.[1] || 'Unknown',
      faultString: faultStringMatch?.[1] || 'Unknown error',
      detail: detailMatch?.[1],
    };
  } catch {
    return {
      faultCode: 'Client',
      faultString: 'Failed to parse fault',
      detail: 'Could not extract fault details from response',
    };
  }
}

/**
 * Format GetBookUserBookingCount request into SOAP XML
 */
export function formatGetBookUserBookingCountRequest(loginguid: string): string {
  if (!loginguid || loginguid.trim() === '') {
    throw new Error('loginguid is required');
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetBookUserBookingCount xmlns="http://www.rco.se/Api/Mobile">
      <loginguid xsi:type="xsd:string">${escapeXml(loginguid)}</loginguid>
    </GetBookUserBookingCount>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * Get headers for GetBookUserBookingCount SOAP request
 */
export function getGetBookUserBookingCountHeaders(): SoapHeaders {
  return {
    'Content-Type': 'text/xml; charset=utf-8',
    SOAPAction: '"http://www.rco.se/Api/Mobile/GetBookUserBookingCount"',
  };
}

/**
 * Format GetBookUserBookings request into SOAP XML
 */
export function formatGetBookUserBookingsRequest(loginguid: string, bookindex: number): string {
  if (!loginguid || loginguid.trim() === '') {
    throw new Error('loginguid is required');
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetBookUserBookings xmlns="http://www.rco.se/Api/Mobile">
      <loginguid xsi:type="xsd:string">${escapeXml(loginguid)}</loginguid>
      <bookindex xsi:type="xsd:long">${bookindex}</bookindex>
    </GetBookUserBookings>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * Get headers for GetBookUserBookings SOAP request
 */
export function getGetBookUserBookingsHeaders(): SoapHeaders {
  return {
    'Content-Type': 'text/xml; charset=utf-8',
    SOAPAction: '"http://www.rco.se/Api/Mobile/GetBookUserBookings"',
  };
}

/**
 * Parse GetBookUserBookings SOAP response XML
 */
export function parseGetBookUserBookingsResponse(
  xml: string,
): SoapResponse<GetBookUserBookingsResponse> {
  try {
    const fault = parseSoapFault(xml);
    if (fault) {
      return {
        success: false,
        fault,
        rawResponse: xml,
      };
    }

    // Extract all BookUserBooking elements
    const bookings: BookUserBooking[] = [];
    const bookingMatches = xml.matchAll(/<BookUserBooking>[\s\S]*?<\/BookUserBooking>/g);

    for (const match of bookingMatches) {
      const bookingXml = match[0];

      try {
        const bookIndex = extractXmlValue(bookingXml, 'BookIndex');
        const bookDate = extractXmlValue(bookingXml, 'BookDate');
        const bookTime = extractXmlValue(bookingXml, 'BookTime');
        const bookPass = extractXmlValue(bookingXml, 'BookPass');
        const bookMachineGroupName = extractXmlValue(bookingXml, 'BookMachineGroupName');
        const bookMachineGroup = extractXmlValue(bookingXml, 'BookMachineGroup');
        const bookMachineGroupType = extractXmlValue(bookingXml, 'BookMachineGroupType');
        const bookUnit = extractXmlValue(bookingXml, 'BookUnit');
        const bookUnitName = extractXmlValue(bookingXml, 'BookUnitName');
        const canDelete = extractXmlValue(bookingXml, 'CanDelete');

        const booking: BookUserBooking = {
          BookIndex: parseInt(bookIndex, 10),
          BookDate: bookDate,
          BookTime: bookTime,
          BookPass: bookPass,
          BookMachineGroupName: bookMachineGroupName,
          BookMachineGroup: bookMachineGroup,
          BookMachineGroupType: bookMachineGroupType,
          BookUnit: bookUnit,
          BookUnitName: bookUnitName,
          CanDelete: canDelete === 'true',
        };

        bookings.push(booking);
      } catch (parseError) {
        console.error('Failed to parse booking element:', parseError);
        // Continue parsing other bookings
      }
    }

    return {
      success: true,
      data: {
        GetBookUserBookingsResult: bookings,
      },
      rawResponse: xml,
    };
  } catch (error) {
    return {
      success: false,
      fault: {
        faultCode: 'Client',
        faultString: 'Failed to parse GetBookUserBookings response',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      rawResponse: xml,
    };
  }
}

/**
 * Make GetBookUserBookings SOAP request
 */
export async function getBookUserBookings(
  loginguid: string,
  bookindex: number,
  serverUrl?: string,
): Promise<SoapResponse<GetBookUserBookingsResponse>> {
  if (!loginguid || loginguid.trim() === '') {
    throw new Error('loginguid is required');
  }

  const endpoint = serverUrl || process.env.NEXT_PUBLIC_SOAP_ENDPOINT || '';
  if (!endpoint) {
    throw new Error('SOAP endpoint is required');
  }

  try {
    const xml = formatGetBookUserBookingsRequest(loginguid, bookindex);
    const headers = getGetBookUserBookingsHeaders();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: xml,
    });

    if (!response.ok) {
      return {
        success: false,
        fault: {
          faultCode: 'HTTP',
          faultString: `HTTP ${response.status}: ${response.statusText}`,
        },
        rawResponse: await response.text(),
      };
    }

    const responseXml = await response.text();
    return parseGetBookUserBookingsResponse(responseXml);
  } catch (error) {
    return {
      success: false,
      fault: {
        faultCode: 'Client',
        faultString: 'Network error',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      rawResponse: '',
    };
  }
}

/**
 * Unified SOAP client object for easier importing and testing
 */
export const soapClient = {
  login,
  logout,
  getAllTerminalMessageLite,
  getOneTerminalMessageLite,
  getTerminalMessageImage,
  getBookUserBookings,
  isHealthy,
  parseLoginResponse,
  parseLogoutResponse,
  parseGetAllTerminalMessageLiteResponse,
  parseGetTerminalMessageImageResponse,
  parseGetBookUserBookingsResponse,
  getLoginHeaders,
  getLogoutHeaders,
  getGetAllTerminalMessageLiteHeaders,
  getGetTerminalMessageImageHeaders,
  getGetBookUserBookingsHeaders,
  formatLoginRequest,
  formatLogoutRequest,
  formatGetAllTerminalMessageLiteRequest,
  formatGetTerminalMessageImageRequest,
  formatGetBookUserBookingsRequest,
  parseSoapFault,
  extractSystemnameFromUrl,
};
