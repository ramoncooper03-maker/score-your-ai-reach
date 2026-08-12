/**
 * Deterministic idempotency keys for scan orchestration.
 * Re-requesting the same scan for the same business inputs within the same
 * window produces the same key, so the unique constraint on
 * (business_id, idempotency_key) prevents duplicate scans.
 */

export interface ScanIdempotencyInput {
  businessId: string;
  scanType: string;
  providers: readonly string[];
  /** Bucket the request falls into, e.g. an ISO date. */
  window: string;
  /** Any additional inputs that change the scan definition. */
  inputs?: Readonly<Record<string, string | number | boolean | null | undefined>>;
}

/** FNV-1a 32-bit — small, dependency-free, stable across runtimes. */
export function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function canonicalizeInputs(input: ScanIdempotencyInput): string {
  const extras = Object.entries(input.inputs ?? {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}=${String(value).trim().toLowerCase()}`)
    .sort();

  return [
    `business=${input.businessId}`,
    `type=${input.scanType.trim().toLowerCase()}`,
    `providers=${[...new Set(input.providers.map((provider) => provider.trim().toLowerCase()))].sort().join(",")}`,
    `window=${input.window}`,
    ...extras,
  ].join("|");
}

export function buildScanIdempotencyKey(input: ScanIdempotencyInput): string {
  return `scan_${stableHash(canonicalizeInputs(input))}`;
}

/** UTC day bucket, used as the default idempotency window. */
export function dayWindow(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
