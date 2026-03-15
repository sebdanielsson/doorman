/**
 * Contract test for SOAP Logout operation
 * Based on contracts/soap-auth.md specifications
 */

import { describe, test, expect } from '@jest/globals';
import type { LogoutRequest, LogoutResponse, SoapResponse } from '@/types/soap';
import * as soapClient from '@/lib/soap-client';

// Define expected interface for soap client
interface SoapClientApi {
  formatLogoutRequest: (request: LogoutRequest) => string;
  parseLogoutResponse: (xml: string) => SoapResponse<LogoutResponse>;
  getLogoutHeaders: () => Record<string, string>;
}

const client = soapClient as unknown as SoapClientApi;

describe('SOAP Logout Contract', () => {
  test('should format logout request XML correctly', () => {
    const request: LogoutRequest = {
      loginguid: 'mock-login-guid-123',
    };

    expect(() => client.formatLogoutRequest(request)).not.toThrow();

    const xmlRequest = client.formatLogoutRequest(request);

    // Validate XML structure per contract specification
    expect(xmlRequest).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(xmlRequest).toContain('<soap:Envelope');
    expect(xmlRequest).toContain('xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"');
    expect(xmlRequest).toContain('<Logout xmlns="http://www.rco.se/Api/Mobile/">');
    expect(xmlRequest).toContain('<loginguid>mock-login-guid-123</loginguid>');
  });

  test('should parse successful logout response correctly', () => {
    const mockSuccessResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <LogoutResponse xmlns="http://www.rco.se/Api/Mobile/">
      <LogoutResult>true</LogoutResult>
    </LogoutResponse>
  </soap:Body>
</soap:Envelope>`;

    expect(() => client.parseLogoutResponse(mockSuccessResponse)).not.toThrow();

    const parsed: SoapResponse<LogoutResponse> = client.parseLogoutResponse(mockSuccessResponse);

    expect(parsed.success).toBe(true);
    expect(parsed.data?.LogoutResult).toBe(true);
    expect(parsed.fault).toBeUndefined();
    expect(parsed.rawResponse).toBe(mockSuccessResponse);
  });

  test('should parse SOAP fault response correctly', () => {
    const mockFaultResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>Server</faultcode>
      <faultstring>Invalid login session</faultstring>
      <detail>Login session has expired or is invalid</detail>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`;

    const parsed: SoapResponse<LogoutResponse> = client.parseLogoutResponse(mockFaultResponse);

    expect(parsed.success).toBe(false);
    expect(parsed.data).toBeUndefined();
    expect(parsed.fault).toBeDefined();
    expect(parsed.fault?.faultCode).toBe('Server');
    expect(parsed.fault?.faultString).toBe('Invalid login session');
    expect(parsed.fault?.detail).toBe('Login session has expired or is invalid');
  });

  test('should set correct SOAP headers', () => {
    const headers = client.getLogoutHeaders();

    expect(headers['Content-Type']).toBe('text/xml; charset=utf-8');
    expect(headers['SOAPAction']).toBe('"http://www.rco.se/Api/Mobile/Logout"');
  });
});
