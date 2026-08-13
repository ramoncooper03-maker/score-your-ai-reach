/**
 * Provider adapter contract for web-grounded AI discovery engines.
 *
 * NOTE: no provider is implemented here on purpose. Adapters must be written
 * against each vendor's current official API documentation, server-side only,
 * reading credentials from server environment variables inside the request
 * handler. Nothing in this module may be imported into client code paths that
 * expose keys.
 */

export interface DiscoveryQuery {
  id: string;
  text: string;
  intentType: string;
  locale: string;
}

export interface DiscoverySource {
  url: string;
  title?: string | null;
  position?: number | null;
}

export interface DiscoveryAnswer {
  /** Full answer text as returned by the provider. UNTRUSTED input. */
  answerText: string;
  /** Web sources the provider cited, when the provider exposes them. */
  sources: DiscoverySource[];
  /** Provider-reported model identifier. */
  model: string | null;
  /** Unmodified provider payload, stored as scan evidence for auditability. */
  raw: unknown;
  latencyMs: number;
}

export type ProviderFailureKind =
  "auth" | "rate_limit" | "timeout" | "unsupported" | "server" | "unknown";

export class ProviderError extends Error {
  constructor(
    public readonly kind: ProviderFailureKind,
    message: string,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export interface ProviderCapabilities {
  /** The provider grounds answers in live web results. */
  webGrounded: boolean;
  /** The provider returns citation URLs. */
  returnsCitations: boolean;
}

export interface RunOptions {
  timeoutMs: number;
  signal?: AbortSignal;
}

/**
 * Every engine AIeometer tests implements this interface.
 * Implementations must: validate config, enforce the timeout, surface
 * ProviderError for failures (never throw raw vendor errors), and return the
 * raw payload untouched so scoring stays auditable.
 */
export interface DiscoveryProviderAdapter {
  /** Stable slug stored in scan_runs.provider, e.g. "provider-a". */
  readonly id: string;
  readonly displayName: string;
  readonly capabilities: ProviderCapabilities;
  /** True when required server credentials are present. */
  isConfigured(): boolean;
  ask(query: DiscoveryQuery, options: RunOptions): Promise<DiscoveryAnswer>;
}

export interface ProviderRegistry {
  list(): DiscoveryProviderAdapter[];
  get(id: string): DiscoveryProviderAdapter | undefined;
  configured(): DiscoveryProviderAdapter[];
}

/** In-memory registry. Adapters register themselves at server startup. */
export function createProviderRegistry(
  adapters: readonly DiscoveryProviderAdapter[] = [],
): ProviderRegistry {
  const map = new Map(adapters.map((adapter) => [adapter.id, adapter]));
  return {
    list: () => [...map.values()],
    get: (id) => map.get(id),
    configured: () => [...map.values()].filter((adapter) => adapter.isConfigured()),
  };
}

/** Timeout + bounded retry wrapper every adapter call should go through. */
export async function runWithRetry(
  adapter: DiscoveryProviderAdapter,
  query: DiscoveryQuery,
  options: { timeoutMs: number; attempts: number },
): Promise<DiscoveryAnswer> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs);
    try {
      return await adapter.ask(query, { timeoutMs: options.timeoutMs, signal: controller.signal });
    } catch (error) {
      lastError = error;
      const retryable = error instanceof ProviderError ? error.retryable : false;
      if (!retryable || attempt === options.attempts) break;
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new ProviderError("unknown", "Provider call failed");
}
