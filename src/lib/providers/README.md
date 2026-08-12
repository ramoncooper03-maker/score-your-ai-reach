# Provider adapters

`types.ts` defines the only contract the rest of the app depends on
(`DiscoveryProviderAdapter`). No vendor integration exists yet — that is
deliberate.

To add an engine:

1. Create `src/lib/providers/<provider>.server.ts` implementing
   `DiscoveryProviderAdapter` against the vendor's **current official API
   documentation**. Do not guess endpoints or parameters.
2. Read credentials with `process.env['<PROVIDER>_API_KEY']` **inside** the
   request/handler scope. Never `VITE_`-prefix a provider key and never import
   the adapter from client code.
3. Return the vendor payload unmodified in `raw` so scores remain auditable and
   recomputable.
4. Throw `ProviderError` with the right `kind`/`retryable` flag; the
   orchestrator records per-provider failures and marks the scan `partial`.
5. Treat `answerText` and citations as untrusted input — pass them through
   `src/lib/security/sanitize.ts` before storage or prompt reuse.

Scoring never calls a provider or an LLM: `src/lib/scoring` reads stored
evidence only.
