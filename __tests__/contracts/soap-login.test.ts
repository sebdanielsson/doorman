/**
 * Contract test for SOAP Login operation
 * Based on contracts/soap-auth.md specifications
 *
 * This test validates the SOAP request/response format and ensures
 * the client correctly formats requests and parses responses.
 */

import { describe, test, expect } from 'vitest';
import type { LoginResponse, SoapResponse } from '@/types/soap';
import type { LoginCredentials } from '@/types/auth';
import { formatLoginRequest, parseLoginResponse, getLoginHeaders } from '@/lib/soap-client';

const SERVER_URL = 'https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx';

describe('SOAP Login Contract', () => {
  test('should format login request XML correctly', () => {
    const credentials: LoginCredentials = {
      serverUrl: SERVER_URL,
      username: '001',
      password: 'test-password',
      timeout: 30,
    };

    const xmlRequest = formatLoginRequest(credentials, SERVER_URL);

    // Validate XML structure per contract specification
    expect(xmlRequest).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(xmlRequest).toContain('<soap:Envelope');
    expect(xmlRequest).toContain('xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"');
    expect(xmlRequest).toContain('<Login xmlns="http://www.rco.se/Api/Mobile">');
    // systemname is derived from the server URL path, not passed in directly
    expect(xmlRequest).toContain('<systemname xsi:type="xsd:string">S0144BrfAsen</systemname>');
    expect(xmlRequest).toContain('<username xsi:type="xsd:string">001</username>');
    expect(xmlRequest).toContain('<Password xsi:type="xsd:string">test-password</Password>');
    expect(xmlRequest).toContain('<timeout xsi:type="xsd:int">30</timeout>');
  });

  test('should escape XML special characters in credentials', () => {
    const credentials: LoginCredentials = {
      serverUrl: SERVER_URL,
      username: '001',
      password: 'pa<ss&"word"',
      timeout: 30,
    };

    const xmlRequest = formatLoginRequest(credentials, SERVER_URL);

    expect(xmlRequest).toContain(
      '<Password xsi:type="xsd:string">pa&lt;ss&amp;&quot;word&quot;</Password>',
    );
  });

  test('should reject a server URL it cannot derive a systemname from', () => {
    const credentials: LoginCredentials = {
      serverUrl: 'not-a-url',
      username: '001',
      password: 'test-password',
      timeout: 30,
    };

    expect(() => formatLoginRequest(credentials, 'not-a-url')).toThrow('Invalid server URL');
  });

  test('should parse successful login response correctly', () => {
    const mockSuccessResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <LoginResponse xmlns="http://www.rco.se/Api/Mobile/">
      <LoginResult>mock-login-guid-123</LoginResult>
    </LoginResponse>
  </soap:Body>
</soap:Envelope>`;

    const parsed: SoapResponse<LoginResponse> = parseLoginResponse(mockSuccessResponse);

    expect(parsed.success).toBe(true);
    expect(parsed.data?.LoginResult).toBe('mock-login-guid-123');
    expect(parsed.fault).toBeUndefined();
    expect(parsed.rawResponse).toBe(mockSuccessResponse);
  });

  test('should parse SOAP fault response correctly', () => {
    const mockFaultResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>Client</faultcode>
      <faultstring>Invalid credentials</faultstring>
      <detail>Username or password is incorrect</detail>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`;

    const parsed: SoapResponse<LoginResponse> = parseLoginResponse(mockFaultResponse);

    expect(parsed.success).toBe(false);
    expect(parsed.data).toBeUndefined();
    expect(parsed.fault).toBeDefined();
    expect(parsed.fault?.faultCode).toBe('Client');
    expect(parsed.fault?.faultString).toBe('Invalid credentials');
    expect(parsed.fault?.detail).toBe('Username or password is incorrect');
  });

  test('should set correct SOAP headers', () => {
    const headers = getLoginHeaders();

    expect(headers['Content-Type']).toBe('text/xml; charset=utf-8');
    expect(headers['SOAPAction']).toBe('"http://www.rco.se/Api/Mobile/Login"');
  });
});
