/**
 * Server-only scan orchestration helpers.
 *
 * Orchestration is idempotent: a repeat request for the same business, scan
 * type and day resolves to the existing scan instead of creating a second one.
 * Provider execution is intentionally NOT implemented — adapters land behind
 * `src/lib/providers/types.ts`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { buildStandardQueries } from "@/lib/scan/queries";
import { buildScanIdempotencyKey, dayWindow } from "@/lib/scoring/idempotency";
import { normalizeHost } from "@/lib/scoring/normalize";

type Client = SupabaseClient<Database>;
type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];

/** Providers this deployment intends to test. Adapters are registered later. */
export const REQUESTED_PROVIDERS: readonly string[] = [];

export async function logAudit(
  admin: Client,
  entry: { actorId: string; action: string; businessId?: string | null; scanId?: string | null; targetType?: string; targetId?: string; metadata?: Record<string, unknown> },
): Promise<void> {
  const { error } = await admin.from("audit_logs").insert({
    actor_id: entry.actorId,
    action: entry.action,
    business_id: entry.businessId ?? null,
    scan_id: entry.scanId ?? null,
    target_type: entry.targetType ?? null,
    target_id: entry.targetId ?? null,
    metadata: (entry.metadata ?? {}) as never,
  });
  if (error) console.error("[audit] failed to write entry", error.message);
}

/** Simple per-user rate limit backed by usage_events (no extra infrastructure). */
export async function assertWithinRateLimit(
  admin: Client,
  userId: string,
  eventType: string,
  maxPerHour: number,
): Promise<void> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await admin
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId)
    .eq("event_type", eventType)
    .gte("created_at", since);

  if (error) {
    console.error("[rate-limit] lookup failed", error.message);
    return;
  }
  if ((count ?? 0) >= maxPerHour) {
    throw new Error("Rate limit reached. Please try again in an hour.");
  }
}

export interface EnsureScanResult {
  scanId: string;
  created: boolean;
  status: Database["public"]["Enums"]["scan_status"];
}

/**
 * Create (or return) the scan for this business + type + day, then persist the
 * standardized query set. Safe to call repeatedly.
 */
export async function ensureScan(
  admin: Client,
  business: BusinessRow,
  scanType: string,
  now: Date = new Date(),
): Promise<EnsureScanResult> {
  const idempotencyKey = buildScanIdempotencyKey({
    businessId: business.id,
    scanType,
    providers: REQUESTED_PROVIDERS,
    window: dayWindow(now),
    inputs: {
      category: business.category,
      city: business.city,
      state: business.state,
      services: [...business.primary_services].sort().join(","),
      host: normalizeHost(business.website ?? ""),
    },
  });

  const { data: existing, error: existingError } = await admin
    .from("scans")
    .select("id,status")
    .eq("business_id", business.id)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existingError) throw new Error("Could not check for an existing scan.");
  if (existing) return { scanId: existing.id, created: false, status: existing.status };

  const { data: inserted, error: insertError } = await admin
    .from("scans")
    .insert({
      business_id: business.id,
      owner_id: business.owner_id,
      scan_type: scanType,
      idempotency_key: idempotencyKey,
      status: "validating",
      providers_requested: [...REQUESTED_PROVIDERS],
      started_at: now.toISOString(),
    })
    .select("id,status")
    .single();

  if (insertError || !inserted) {
    // Unique violation = another request won the race; return that scan.
    const { data: raced } = await admin
      .from("scans")
      .select("id,status")
      .eq("business_id", business.id)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (raced) return { scanId: raced.id, created: false, status: raced.status };
    throw new Error("Could not start a scan.");
  }

  const queries = buildStandardQueries({
    category: business.category,
    city: business.city,
    state: business.state,
    primaryServices: business.primary_services,
  });

  const { error: queriesError } = await admin.from("scan_queries").insert(
    queries.map((query) => ({
      scan_id: inserted.id,
      query_text: query.queryText,
      intent_type: query.intentType,
      service_focus: query.serviceFocus,
      locale: query.locale,
      position: query.position,
    })),
  );
  if (queriesError) console.error("[scan] failed to persist queries", queriesError.message);

  await admin
    .from("scans")
    .update({ status: "generating_queries", progress: 25 })
    .eq("id", inserted.id);

  return { scanId: inserted.id, created: true, status: "generating_queries" };
}
