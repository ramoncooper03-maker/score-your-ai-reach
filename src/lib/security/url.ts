/**
 * Strict URL validation for anything the server is asked to fetch.
 * Blocks non-HTTP(S) schemes, credentials, non-default ports, localhost,
 * private/link-local/loopback IP ranges, and internal TLDs (SSRF defence).
 */

export type UrlRejectionReason =
  | "empty"
  | "invalid"
  | "scheme"
  | "credentials"
  | "port"
  | "localhost"
  | "private_ip"
  | "ip_literal_v6"
  | "internal_tld"
  | "too_long";

export interface UrlValidationSuccess {
  ok: true;
  url: string;
  host: string;
}

export interface UrlValidationFailure {
  ok: false;
  reason: UrlRejectionReason;
  message: string;
}

export type UrlValidationResult = UrlValidationSuccess | UrlValidationFailure;

const ALLOWED_PORTS = new Set(["", "80", "443"]);
const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "metadata.google.internal",
]);
const BLOCKED_TLDS = [
  "localhost",
  "local",
  "internal",
  "intranet",
  "lan",
  "home",
  "corp",
  "test",
  "example",
  "invalid",
];

function isPrivateIPv4(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4) return false;
  const octets = parts.map((part) => Number(part));
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;
  const [a, b] = octets as [number, number, number, number];
  if (a === 0 || a === 10 || a === 127) return true; // this-network, private, loopback
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 169 && b === 254) return true; // link-local (incl. cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0) return true;
  if (a >= 224) return true; // multicast + reserved
  return false;
}

function isIPv4Literal(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

function fail(reason: UrlRejectionReason, message: string): UrlValidationFailure {
  return { ok: false, reason, message };
}

/**
 * Validate and normalize a user-supplied website URL.
 * A bare domain ("example.com") is upgraded to https://.
 */
export function validateWebsiteUrl(input: string | null | undefined): UrlValidationResult {
  const raw = (input ?? "").trim();
  if (!raw) return fail("empty", "Enter a website address.");
  if (raw.length > 2000) return fail("too_long", "That website address is too long.");

  // Any explicit scheme is preserved so non-http schemes are rejected below.
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return fail("invalid", "That does not look like a valid website address.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return fail("scheme", "Only http and https addresses are supported.");
  }
  if (url.username || url.password) {
    return fail("credentials", "Website addresses must not contain login credentials.");
  }
  if (!ALLOWED_PORTS.has(url.port)) {
    return fail("port", "Only standard web ports (80 and 443) are supported.");
  }

  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (host.startsWith("[") || host.includes(":")) {
    return fail("ip_literal_v6", "IPv6 literal addresses cannot be scanned.");
  }
  if (BLOCKED_HOSTS.has(host) || host === "localhost") {
    return fail("localhost", "Local addresses cannot be scanned.");
  }
  const tld = host.split(".").pop() ?? "";
  if (BLOCKED_TLDS.includes(tld)) {
    return fail("internal_tld", "Internal or reserved domains cannot be scanned.");
  }
  if (isIPv4Literal(host)) {
    if (isPrivateIPv4(host))
      return fail("private_ip", "Private or loopback IP addresses cannot be scanned.");
    return fail("private_ip", "Enter a domain name instead of an IP address.");
  }
  if (!host || !host.includes(".")) {
    return fail("invalid", "Enter a full public domain, for example example.com.");
  }

  url.hash = "";
  url.hostname = host;
  return { ok: true, url: url.toString(), host: host.replace(/^www\./, "") };
}

/** Convenience guard used by fetchers before every request, including redirects. */
export function assertFetchableUrl(input: string): string {
  const result = validateWebsiteUrl(input);
  if (!result.ok) throw new Error(`Blocked URL (${result.reason}): ${result.message}`);
  return result.url;
}
