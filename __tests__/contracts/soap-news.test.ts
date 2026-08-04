/**
 * SOAP Contract Test: GetAllTerminalMessageLite
 * Based on contracts/soap-announcements.md specifications
 *
 * CRITICAL: This test MUST FAIL until T010 is implemented
 */

import { describe, expect, it, beforeEach, vi, type Mock } from 'vitest';
import type { TrmMessageLite, GetAllTerminalMessageLiteResponse, SoapResponse } from '@/types/soap';
import { soapClient } from '@/lib/soap-client';

// Mock fetch for controlled testing
global.fetch = vi.fn() as Mock;

describe('SOAP Contract: GetAllTerminalMessageLite', () => {
  const mockLoginguid = 'test-guid-12345';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Contract', () => {
    it('should call SOAP operation with correct parameters', async () => {
      // Arrange
      const mockXmlResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetAllTerminalMessageLiteResponse xmlns="http://www.rco.se/Api/Mobile">
      <GetAllTerminalMessageLiteResult>
      </GetAllTerminalMessageLiteResult>
    </GetAllTerminalMessageLiteResponse>
  </soap:Body>
</soap:Envelope>`;

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => mockXmlResponse,
      });

      // Act
      const result = await soapClient.getAllTerminalMessageLite(
        mockLoginguid,
        'https://example.com/soap',
      );

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/soap',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: '"http://www.rco.se/Api/Mobile/GetAllTerminalMessageLite"',
          }),
          body: expect.stringContaining('<GetAllTerminalMessageLite'),
        }),
      );
      expect(result.success).toBe(true);
    });

    it('should require loginguid parameter', async () => {
      // Act & Assert
      await expect(soapClient.getAllTerminalMessageLite('')).rejects.toThrow(
        'loginguid is required',
      );
    });
  });

  describe('Response Contract', () => {
    it('should return array of TrmMessageLite objects', async () => {
      // Arrange
      const mockXmlResponse = `<?xml version="1.0" encoding="utf-8"?>
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
      </GetAllTerminalMessageLiteResult>
    </GetAllTerminalMessageLiteResponse>
  </soap:Body>
</soap:Envelope>`;

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => mockXmlResponse,
      });

      // Act
      const result = await soapClient.getAllTerminalMessageLite(
        mockLoginguid,
        'https://example.com/soap',
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.GetAllTerminalMessageLiteResult).toHaveLength(1);

      const message = result.data?.GetAllTerminalMessageLiteResult[0];
      expect(message).toMatchObject({
        MessageId: 1,
        ContentType: 1,
        CreatedDate: '2025-01-25T10:30:00',
        MessageHeader: 'Building Maintenance Notice',
        RelatedMessageId: 0,
        TextMessage: [
          'The laundry room will be closed for maintenance',
          'on Saturday from 9:00 AM to 2:00 PM.',
        ],
        HasImage: true,
        IsHeader: false,
        RelatedContentType: 0,
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      const mockXmlResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetAllTerminalMessageLiteResponse xmlns="http://www.rco.se/Api/Mobile">
      <GetAllTerminalMessageLiteResult>
      </GetAllTerminalMessageLiteResult>
    </GetAllTerminalMessageLiteResponse>
  </soap:Body>
</soap:Envelope>`;

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => mockXmlResponse,
      });

      // Act
      const result = await soapClient.getAllTerminalMessageLite(
        mockLoginguid,
        'https://example.com/soap',
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.GetAllTerminalMessageLiteResult).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      // Arrange
      const mockXmlResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Client</faultcode>
      <faultstring>Invalid login GUID</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`;

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => mockXmlResponse,
      });

      // Act
      const result = await soapClient.getAllTerminalMessageLite(
        'invalid-guid',
        'https://example.com/soap',
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.fault?.faultCode).toBe('soap:Client');
      expect(result.fault?.faultString).toBe('Invalid login GUID');
    });

    it('should handle server errors', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server Error',
      });

      // Act
      const result = await soapClient.getAllTerminalMessageLite(
        mockLoginguid,
        'https://example.com/soap',
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.fault?.faultCode).toBe('HTTP');
      expect(result.fault?.faultString).toContain('500');
    });

    it('should handle network errors', async () => {
      // Arrange
      (global.fetch as Mock).mockRejectedValue(new Error('Network timeout'));

      // Act
      const result = await soapClient.getAllTerminalMessageLite(
        mockLoginguid,
        'https://example.com/soap',
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.fault?.faultCode).toBe('Client');
      expect(result.fault?.faultString).toBe('Network error');
      expect(result.fault?.detail).toBe('Network timeout');
    });
  });

  describe('Data Validation', () => {
    it('should parse TrmMessageLite structure correctly', async () => {
      // Arrange
      const mockXmlResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetAllTerminalMessageLiteResponse xmlns="http://www.rco.se/Api/Mobile">
      <GetAllTerminalMessageLiteResult>
        <TrmMessageLite>
          <MessageId>123</MessageId>
          <ContentType>2</ContentType>
          <CreatedDate>2025-01-25T10:30:00</CreatedDate>
          <MessageHeader>Test Message</MessageHeader>
          <RelatedMessageId>0</RelatedMessageId>
          <TextMessage>
            <string>Line 1</string>
            <string>Line 2</string>
          </TextMessage>
          <HasImage>false</HasImage>
          <IsHeader>true</IsHeader>
          <RelatedContentType>1</RelatedContentType>
        </TrmMessageLite>
      </GetAllTerminalMessageLiteResult>
    </GetAllTerminalMessageLiteResponse>
  </soap:Body>
</soap:Envelope>`;

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => mockXmlResponse,
      });

      // Act
      const result = await soapClient.getAllTerminalMessageLite(
        mockLoginguid,
        'https://example.com/soap',
      );

      // Assert
      expect(result.success).toBe(true);
      const message = result.data?.GetAllTerminalMessageLiteResult[0];

      expect(typeof message?.MessageId).toBe('number');
      expect(typeof message?.ContentType).toBe('number');
      expect(typeof message?.CreatedDate).toBe('string');
      expect(typeof message?.MessageHeader).toBe('string');
      expect(typeof message?.RelatedMessageId).toBe('number');
      expect(Array.isArray(message?.TextMessage)).toBe(true);
      expect(typeof message?.HasImage).toBe('boolean');
      expect(typeof message?.IsHeader).toBe('boolean');
      expect(typeof message?.RelatedContentType).toBe('number');
    });
  });
});
