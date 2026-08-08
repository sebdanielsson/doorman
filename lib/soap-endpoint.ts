/**
 * Validation for the user-supplied SOAP endpoint.
 *
 * Users pick which laundry service they connect to, so the endpoint URL is
 * attacker-controllable by definition. Rather than allow-listing hosts (which
 * would break the feature), this narrows what an endpoint is allowed to look
 * like so it cannot be aimed at the server's own network:
 *
 *   - https only, on the default port, with no embedded credentials
 *   - the host must be a public, dotted DNS name or public IP literal
 *   - the path must be a VisionMobile API endpoint
 *
 * Caveat: this validates the URL, not the address it ultimately resolves to. A
 * public hostname with a private A record (or a DNS rebind between this check
 * and the request) still gets through. Blocking that needs resolve-then-pin at
 * the socket layer, which `fetch` does not expose.
 */

/** Path of a VisionMobile endpoint, with up to four leading path segments. */
const ENDPOINT_PATH = /^(?:\/[\w.~-]{1,64}){0,4}\/api\/mobile\/visionmobile\.asmx$/i;

const BLOCKED_HOSTNAMES = new Set(['localhost', 'metadata.google.internal']);

const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.home.arpa'];

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

export class InvalidSoapEndpointError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSoapEndpointError';
  }
}

/**
 * True for IPv4 literals that are loopback, private, link-local, CGNAT,
 * multicast or otherwise not publicly routable.
 */
function isPrivateIpv4(hostname: string): boolean {
  const match = IPV4.exec(hostname);
  if (!match) {
    return false;
  }

  const octets = match.slice(1).map(Number);
  if (octets.some((octet) => octet > 255)) {
    // Not a valid address; treat as untrusted rather than guessing.
    return true;
  }

  const [a, b] = octets;

  return (
    a === 0 || // 0.0.0.0/8 "this network"
    a === 10 || // 10.0.0.0/8 private
    a === 127 || // 127.0.0.0/8 loopback
    (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 CGNAT
    (a === 169 && b === 254) || // 169.254.0.0/16 link-local + cloud metadata
    (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12 private
    (a === 192 && b === 0) || // 192.0.0.0/24 IETF protocol assignments
    (a === 192 && b === 168) || // 192.168.0.0/16 private
    (a === 198 && (b === 18 || b === 19)) || // 198.18.0.0/15 benchmarking
    a >= 224 // 224.0.0.0/4 multicast + 240.0.0.0/4 reserved
  );
}

/**
 * True for IPv6 literals that are loopback, unique-local, link-local, or an
 * IPv4-mapped form of a non-public IPv4 address. `URL` keeps the brackets on
 * `hostname` for IPv6 literals.
 */
function isPrivateIpv6(hostname: string): boolean {
  if (!hostname.startsWith('[') || !hostname.endsWith(']')) {
    return false;
  }

  const address = hostname.slice(1, -1).toLowerCase();

  if (address === '::1' || address === '::') {
    return true;
  }

  // IPv4-mapped (::ffff:127.0.0.1) and IPv4-compatible (::127.0.0.1) forms.
  const embeddedIpv4 = address.slice(address.lastIndexOf(':') + 1);
  if (IPV4.test(embeddedIpv4)) {
    return isPrivateIpv4(embeddedIpv4);
  }

  return (
    address.startsWith('fc') || // fc00::/7 unique-local
    address.startsWith('fd') ||
    address.startsWith('fe8') || // fe80::/10 link-local
    address.startsWith('fe9') ||
    address.startsWith('fea') ||
    address.startsWith('feb') ||
    address.startsWith('ff') // ff00::/8 multicast
  );
}

function isBlockedHost(hostname: string): boolean {
  if (BLOCKED_HOSTNAMES.has(hostname) || BLOCKED_HOST_SUFFIXES.some((s) => hostname.endsWith(s))) {
    return true;
  }

  if (isPrivateIpv6(hostname)) {
    return true;
  }

  if (IPV4.test(hostname)) {
    return isPrivateIpv4(hostname);
  }

  // A single-label name resolves through local search domains, so it can reach
  // internal hosts. Public endpoints always have a dot.
  return !hostname.includes('.');
}

/**
 * Validate a user-supplied SOAP endpoint and return it in canonical form.
 *
 * @throws {InvalidSoapEndpointError} if the URL is not a usable public
 * VisionMobile endpoint.
 */
export function validateSoapEndpoint(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new InvalidSoapEndpointError('Server URL is required');
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new InvalidSoapEndpointError('Server URL is not a valid URL');
  }

  if (url.protocol !== 'https:') {
    throw new InvalidSoapEndpointError('Server URL must use https');
  }

  if (url.username || url.password) {
    throw new InvalidSoapEndpointError('Server URL must not contain credentials');
  }

  if (url.port !== '' && url.port !== '443') {
    throw new InvalidSoapEndpointError('Server URL must use the default https port');
  }

  // Trailing dots ("example.com.") resolve the same but dodge suffix checks.
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');

  if (hostname === '' || isBlockedHost(hostname)) {
    throw new InvalidSoapEndpointError('Server URL must point to a public host');
  }

  const path = ENDPOINT_PATH.exec(url.pathname);
  if (!path) {
    throw new InvalidSoapEndpointError('Server URL must point to a VisionMobile API endpoint');
  }

  // Rebuilt from the validated components: any query string, fragment or
  // userinfo in the original is dropped rather than forwarded.
  return `https://${hostname}${path[0]}`;
}

/** Non-throwing variant, for form validation. */
export function isValidSoapEndpoint(rawUrl: string): boolean {
  try {
    validateSoapEndpoint(rawUrl);
    return true;
  } catch {
    return false;
  }
}
