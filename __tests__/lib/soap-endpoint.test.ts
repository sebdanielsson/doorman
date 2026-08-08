/**
 * Test: SOAP endpoint validation
 * Users supply their own server URL, so this guards what that URL may point at.
 */

import { describe, expect, it } from 'vitest';
import {
  InvalidSoapEndpointError,
  isValidSoapEndpoint,
  validateSoapEndpoint,
} from '@/lib/soap-endpoint';

const VALID = 'https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx';

describe('validateSoapEndpoint', () => {
  it('accepts a public VisionMobile endpoint', () => {
    expect(validateSoapEndpoint(VALID)).toBe(VALID);
  });

  it('accepts any public host, not just a known one', () => {
    const other = 'https://laundry.example.co.uk/BrfExample/api/mobile/visionmobile.asmx';
    expect(validateSoapEndpoint(other)).toBe(other);
  });

  it('accepts nested path segments', () => {
    const nested = 'https://example.com/a/b/c/api/mobile/visionmobile.asmx';
    expect(validateSoapEndpoint(nested)).toBe(nested);
  });

  it('canonicalises host case and drops query and fragment', () => {
    expect(
      validateSoapEndpoint(
        'https://CSHub.EPR-Apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx?x=1#frag',
      ),
    ).toBe(VALID);
  });

  it('rejects plain http', () => {
    expect(() => validateSoapEndpoint(VALID.replace('https:', 'http:'))).toThrow(
      InvalidSoapEndpointError,
    );
  });

  it('rejects embedded credentials', () => {
    expect(() =>
      validateSoapEndpoint(
        'https://user:pass@cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx',
      ),
    ).toThrow(InvalidSoapEndpointError);
  });

  it('rejects a non-default port', () => {
    expect(() =>
      validateSoapEndpoint('https://cshub.epr-apps.com:8080/S0/api/mobile/visionmobile.asmx'),
    ).toThrow(InvalidSoapEndpointError);
  });

  it.each([
    ['loopback', 'https://127.0.0.1/S0/api/mobile/visionmobile.asmx'],
    ['loopback name', 'https://localhost/S0/api/mobile/visionmobile.asmx'],
    ['ipv6 loopback', 'https://[::1]/S0/api/mobile/visionmobile.asmx'],
    ['ipv4-mapped loopback', 'https://[::ffff:127.0.0.1]/S0/api/mobile/visionmobile.asmx'],
    ['private 10/8', 'https://10.1.2.3/S0/api/mobile/visionmobile.asmx'],
    ['private 172.16/12', 'https://172.20.0.1/S0/api/mobile/visionmobile.asmx'],
    ['private 192.168/16', 'https://192.168.1.1/S0/api/mobile/visionmobile.asmx'],
    ['link-local metadata', 'https://169.254.169.254/S0/api/mobile/visionmobile.asmx'],
    ['gcp metadata', 'https://metadata.google.internal/S0/api/mobile/visionmobile.asmx'],
    ['unique-local ipv6', 'https://[fd00::1]/S0/api/mobile/visionmobile.asmx'],
    ['internal suffix', 'https://svc.internal/S0/api/mobile/visionmobile.asmx'],
    ['mdns suffix', 'https://printer.local/S0/api/mobile/visionmobile.asmx'],
    ['single label', 'https://intranet/S0/api/mobile/visionmobile.asmx'],
    ['trailing dot loopback', 'https://localhost./S0/api/mobile/visionmobile.asmx'],
  ])('rejects %s', (_label, url) => {
    expect(() => validateSoapEndpoint(url)).toThrow(InvalidSoapEndpointError);
  });

  it('rejects a public host with a non-VisionMobile path', () => {
    expect(() => validateSoapEndpoint('https://example.com/admin')).toThrow(
      InvalidSoapEndpointError,
    );
  });

  it('rejects empty and malformed input', () => {
    expect(() => validateSoapEndpoint('')).toThrow(InvalidSoapEndpointError);
    expect(() => validateSoapEndpoint('not a url')).toThrow(InvalidSoapEndpointError);
  });
});

describe('isValidSoapEndpoint', () => {
  it('reports validity without throwing', () => {
    expect(isValidSoapEndpoint(VALID)).toBe(true);
    expect(isValidSoapEndpoint('https://127.0.0.1/S0/api/mobile/visionmobile.asmx')).toBe(false);
  });
});
