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
import { extractSystemnameFromUrl } from '@/lib/soap-client';

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

  it('requires a systemname segment before the api path', () => {
    // extractSystemnameFromUrl() reads the segment preceding "api" back out to
    // build the SOAP envelope. With no such segment it reports "api" as the
    // systemname, so this shape must not be accepted as valid.
    expect(() => validateSoapEndpoint('https://example.com/api/mobile/visionmobile.asmx')).toThrow(
      InvalidSoapEndpointError,
    );
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
    ['private 10/8', 'https://10.1.2.3/S0/api/mobile/visionmobile.asmx'],
    ['private 172.16/12', 'https://172.20.0.1/S0/api/mobile/visionmobile.asmx'],
    ['private 192.168/16', 'https://192.168.1.1/S0/api/mobile/visionmobile.asmx'],
    ['link-local metadata', 'https://169.254.169.254/S0/api/mobile/visionmobile.asmx'],
    ['gcp metadata', 'https://metadata.google.internal/S0/api/mobile/visionmobile.asmx'],
    ['internal suffix', 'https://svc.internal/S0/api/mobile/visionmobile.asmx'],
    ['mdns suffix', 'https://printer.local/S0/api/mobile/visionmobile.asmx'],
    ['single label', 'https://intranet/S0/api/mobile/visionmobile.asmx'],
    ['trailing dot loopback', 'https://localhost./S0/api/mobile/visionmobile.asmx'],
  ])('rejects %s', (_label, url) => {
    expect(() => validateSoapEndpoint(url)).toThrow(InvalidSoapEndpointError);
  });

  // `URL` canonicalises these to dotted-quad before validation runs, so the
  // obfuscated spelling must not be a way past the private-range check.
  it.each([
    ['octal', 'https://0177.0.0.1/S0/api/mobile/visionmobile.asmx'],
    ['decimal', 'https://2130706433/S0/api/mobile/visionmobile.asmx'],
    ['hex', 'https://0x7f.1/S0/api/mobile/visionmobile.asmx'],
    ['short form', 'https://127.1/S0/api/mobile/visionmobile.asmx'],
  ])('rejects loopback written in %s form', (_label, url) => {
    expect(() => validateSoapEndpoint(url)).toThrow(InvalidSoapEndpointError);
  });

  // Literals are refused whether or not the address is publicly routable: the
  // encodings that tunnel an internal address through a public-looking prefix
  // (6to4, NAT64, IPv4-mapped) are not distinguishable by inspection, and
  // `URL` rewrites the dotted-quad tail out of the mapped form regardless.
  it.each([
    ['loopback', 'https://[::1]/S0/api/mobile/visionmobile.asmx'],
    ['unspecified', 'https://[::]/S0/api/mobile/visionmobile.asmx'],
    ['unique-local', 'https://[fd00::1]/S0/api/mobile/visionmobile.asmx'],
    ['link-local', 'https://[fe80::1]/S0/api/mobile/visionmobile.asmx'],
    ['ipv4-mapped loopback', 'https://[::ffff:127.0.0.1]/S0/api/mobile/visionmobile.asmx'],
    ['ipv4-mapped metadata', 'https://[::ffff:169.254.169.254]/S0/api/mobile/visionmobile.asmx'],
    ['6to4 wrapping loopback', 'https://[2002:7f00:1::]/S0/api/mobile/visionmobile.asmx'],
    ['nat64 wrapping loopback', 'https://[64:ff9b::7f00:1]/S0/api/mobile/visionmobile.asmx'],
    ['globally routable', 'https://[2606:4700:4700::1111]/S0/api/mobile/visionmobile.asmx'],
  ])('rejects the ipv6 literal form: %s', (_label, url) => {
    expect(() => validateSoapEndpoint(url)).toThrow(InvalidSoapEndpointError);
  });

  it('accepts a hostname regardless of the address family it resolves to', () => {
    // Only the literal form is refused; IPv6-only services remain reachable by
    // name, which is how a real endpoint is addressed.
    const byName = 'https://ipv6-only.example.com/S0/api/mobile/visionmobile.asmx';
    expect(validateSoapEndpoint(byName)).toBe(byName);
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

describe('accepted endpoints yield a usable systemname', () => {
  // The validator is what stands between user input and the SOAP envelope, so
  // anything it accepts must carry a systemname the client can actually read.
  it.each([
    ['https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx', 'S0144BrfAsen'],
    ['https://example.com/a/b/c/api/mobile/visionmobile.asmx', 'c'],
    ['https://example.com/api-host/api/mobile/visionmobile.asmx', 'api-host'],
  ])('%s -> %s', (url, expected) => {
    expect(validateSoapEndpoint(url)).toBe(url);
    expect(extractSystemnameFromUrl(url)).toBe(expected);
  });
});

describe('isValidSoapEndpoint', () => {
  it('reports validity without throwing', () => {
    expect(isValidSoapEndpoint(VALID)).toBe(true);
    expect(isValidSoapEndpoint('https://127.0.0.1/S0/api/mobile/visionmobile.asmx')).toBe(false);
  });
});
