/**
 * Contract test for SOAP Login operation
 * Based on contracts/soap-auth.md specifications
 *
 * This test validates the SOAP request/response format and ensures
 * the client correctly formats requests and parses responses.
 */

import { describe, test, expect } from '@jest/globals';
import type { LoginRequest, LoginResponse, SoapResponse } from '@/types/soap';
import * as soapClient from '@/lib/soap-client';

// Define expected interface for soap client
interface SoapClientApi {
  formatLoginRequest: (credentials: LoginRequest) => string;
  parseLoginResponse: (xml: string) => SoapResponse<LoginResponse>;
  getLoginHeaders: () => Record<string, string>;
}

const client = soapClient as unknown as SoapClientApi;

describe('SOAP Login Contract', () => {
  test('should format login request XML correctly', () => {
    const credentials: LoginRequest = {
      systemname: 'test-system',
      username: '001',
      Password: 'test-password',
      timeout: 30,
    };

    expect(() => client.formatLoginRequest(credentials)).not.toThrow();

    const xmlRequest = client.formatLoginRequest(credentials);

    // Validate XML structure per contract specification
    expect(xmlRequest).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(xmlRequest).toContain('<soap:Envelope');
    expect(xmlRequest).toContain('xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"');
    expect(xmlRequest).toContain('<Login xmlns="http://www.rco.se/Api/Mobile/">');
    expect(xmlRequest).toContain('<systemname>test-system</systemname>');
    expect(xmlRequest).toContain('<username>001</username>');
    expect(xmlRequest).toContain('<Password>test-password</Password>');
    expect(xmlRequest).toContain('<timeout>30</timeout>');
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

    expect(() => client.parseLoginResponse(mockSuccessResponse)).not.toThrow();

    const parsed: SoapResponse<LoginResponse> = client.parseLoginResponse(mockSuccessResponse);

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

    const parsed: SoapResponse<LoginResponse> = client.parseLoginResponse(mockFaultResponse);

    expect(parsed.success).toBe(false);
    expect(parsed.data).toBeUndefined();
    expect(parsed.fault).toBeDefined();
    expect(parsed.fault?.faultCode).toBe('Client');
    expect(parsed.fault?.faultString).toBe('Invalid credentials');
    expect(parsed.fault?.detail).toBe('Username or password is incorrect');
  });

  test('should set correct SOAP headers', () => {
    const headers = client.getLoginHeaders();

    expect(headers['Content-Type']).toBe('text/xml; charset=utf-8');
    expect(headers['SOAPAction']).toBe('"http://www.rco.se/Api/Mobile/Login"');
  });
});
