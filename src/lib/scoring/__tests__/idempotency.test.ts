import { describe, expect, it } from "vitest";

import { buildScanIdempotencyKey, canonicalizeInputs, dayWindow, stableHash } from "../idempotency";

const base = {
  businessId: "11111111-1111-1111-1111-111111111111",
  scanType: "standard",
  providers: ["provider-a", "provider-b"],
  window: "2026-08-12",
};

describe("stableHash", () => {
  it("is stable and differs for different input", () => {
    expect(stableHash("abc")).toBe(stableHash("abc"));
    expect(stableHash("abc")).not.toBe(stableHash("abd"));
    expect(stableHash("")).toHaveLength(8);
  });
});

describe("buildScanIdempotencyKey", () => {
  it("returns the same key for the same scan request", () => {
    expect(buildScanIdempotencyKey(base)).toBe(buildScanIdempotencyKey({ ...base }));
  });

  it("ignores provider order and casing", () => {
    expect(buildScanIdempotencyKey(base)).toBe(
      buildScanIdempotencyKey({ ...base, providers: ["Provider-B", "provider-a"] }),
    );
  });

  it("changes when the scan definition changes", () => {
    const key = buildScanIdempotencyKey(base);
    expect(buildScanIdempotencyKey({ ...base, window: "2026-08-13" })).not.toBe(key);
    expect(buildScanIdempotencyKey({ ...base, scanType: "deep" })).not.toBe(key);
    expect(buildScanIdempotencyKey({ ...base, businessId: "other" })).not.toBe(key);
    expect(buildScanIdempotencyKey({ ...base, inputs: { services: "drain cleaning" } })).not.toBe(
      key,
    );
  });

  it("ignores empty extra inputs and extra-input ordering", () => {
    expect(buildScanIdempotencyKey({ ...base, inputs: { a: "1", b: "2" } })).toBe(
      buildScanIdempotencyKey({
        ...base,
        inputs: { b: "2", a: "1", c: null, d: undefined, e: "" },
      }),
    );
  });

  it("canonicalizes deterministically", () => {
    expect(canonicalizeInputs(base)).toBe(
      `business=${base.businessId}|type=standard|providers=provider-a,provider-b|window=2026-08-12`,
    );
  });
});

describe("dayWindow", () => {
  it("buckets by UTC day", () => {
    expect(dayWindow(new Date("2026-08-12T23:59:59Z"))).toBe("2026-08-12");
    expect(dayWindow(new Date("2026-08-13T00:00:01Z"))).toBe("2026-08-13");
  });
});
