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
  SoapHeaders 
} from '@/types/soap';
import type { LoginCredentials } from '@/types/auth';

/**
 * Extract systemname from server URL path
 * E.g., "https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx" → "S0144BrfAsen"
 */
export function extractSystemnameFromUrl(serverUrl: string): string {
  try {
    const url = new URL(serverUrl);
    const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
    
    // Find the segment before "api/mobile/visionmobile.asmx"
    const apiIndex = pathSegments.findIndex(segment => segment === 'api');
    if (apiIndex > 0) {
      return pathSegments[apiIndex - 1];
    }
    
    // Fallback: use the first non-empty path segment
    if (pathSegments.length > 0) {
      return pathSegments[0];
    }
    
    throw new Error('Unable to extract systemname from URL path');
  } catch (error) {
    throw new Error(`Invalid server URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    'SOAPAction': '"http://www.rco.se/Api/Mobile/Login"',
  };
}

/**
 * Get headers for SOAP logout request
 */
export function getLogoutHeaders(): SoapHeaders {
  return {
    'Content-Type': 'text/xml; charset=utf-8',
    'SOAPAction': '"http://www.rco.se/Api/Mobile/Logout"',
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
      `SOAP Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      `SOAP Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      headers: { 'Accept': 'text/html' },
    });
    return response.ok;
  } catch {
    return false;
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
 * Unified SOAP client object for easier importing and testing
 */
export const soapClient = {
  login,
  logout,
  isHealthy,
  parseLoginResponse,
  parseLogoutResponse,
  getLoginHeaders,
  getLogoutHeaders,
  formatLoginRequest,
  formatLogoutRequest,
  parseSoapFault,
  extractSystemnameFromUrl,
};
