import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { businessInputSchema, createScanSchema, scanIdSchema } from "@/lib/app-schemas";
import { normalizeHost } from "@/lib/scoring/normalize";

export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: businesses, error: businessError }, { data: scans, error: scanError }] =
      await Promise.all([
        context.supabase
          .from("businesses")
          .select("id,name,website,website_host,category,city,state,primary_services,created_at")
          .order("created_at", { ascending: false }),
        context.supabase
          .from("scans")
          .select("id,business_id,status,scan_type,progress,created_at,completed_at,error_message")
          .order("created_at", { ascending: false })
          .limit(25),
      ]);

    if (businessError || scanError) throw new Error("Could not load your workspace.");

    return {
      businesses: businesses ?? [],
      scans: scans ?? [],
    };
  });

export const createBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => businessInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { assertWithinRateLimit, logAudit } = await import("@/lib/scan-orchestration.server");

    await assertWithinRateLimit(supabaseAdmin, context.userId, "business_created", 10);

    const { data: business, error } = await context.supabase
      .from("businesses")
      .insert({
        owner_id: context.userId,
        name: data.name,
        website: data.website,
        website_host: normalizeHost(data.website),
        category: data.category,
        city: data.city,
        state: data.state,
        primary_services: data.primaryServices,
        aliases: data.aliases ?? [],
        phone: data.phone || null,
      })
      .select("id")
      .single();

    if (error || !business) throw new Error("Could not save this business.");

    await supabaseAdmin.from("business_locations").insert({
      business_id: business.id,
      city: data.city,
      state: data.state,
      phone: data.phone || null,
      is_primary: true,
    });
    await supabaseAdmin.from("usage_events").insert({
      owner_id: context.userId,
      event_type: "business_created",
      metadata: { business_id: business.id } as never,
    });
    await logAudit(supabaseAdmin, {
      actorId: context.userId,
      action: "business.created",
      businessId: business.id,
      targetType: "business",
      targetId: business.id,
    });

    return { businessId: business.id };
  });

export const startScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createScanSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { assertWithinRateLimit, ensureScan, logAudit } =
      await import("@/lib/scan-orchestration.server");

    // Ownership is verified through the caller's own RLS-scoped client.
    const { data: business, error } = await context.supabase
      .from("businesses")
      .select("*")
      .eq("id", data.businessId)
      .maybeSingle();

    if (error || !business) throw new Error("Business not found.");

    await assertWithinRateLimit(supabaseAdmin, context.userId, "scan_requested", 20);

    const result = await ensureScan(supabaseAdmin, business, data.scanType);

    await supabaseAdmin.from("usage_events").insert({
      owner_id: context.userId,
      scan_id: result.scanId,
      event_type: "scan_requested",
      metadata: { created: result.created } as never,
    });
    await logAudit(supabaseAdmin, {
      actorId: context.userId,
      action: result.created ? "scan.created" : "scan.reused",
      businessId: business.id,
      scanId: result.scanId,
      targetType: "scan",
      targetId: result.scanId,
    });

    return result;
  });

export const getScanDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => scanIdSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: scan, error } = await context.supabase
      .from("scans")
      .select("*, businesses(id,name,website,website_host,category,city,state,primary_services)")
      .eq("id", data.scanId)
      .maybeSingle();

    if (error || !scan) throw new Error("Scan not found.");

    const [{ data: queries }, { data: runs }, { data: scores }] = await Promise.all([
      context.supabase.from("scan_queries").select("*").eq("scan_id", scan.id).order("position"),
      context.supabase
        .from("scan_runs")
        .select("id,provider,status,latency_ms,error_code")
        .eq("scan_id", scan.id),
      context.supabase
        .from("score_snapshots")
        .select("*")
        .eq("scan_id", scan.id)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    return { scan, queries: queries ?? [], runs: runs ?? [], score: scores?.[0] ?? null };
  });

export const getReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => scanIdSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: scan, error } = await context.supabase
      .from("scans")
      .select("*, businesses(id,name,website,website_host,category,city,state,primary_services)")
      .eq("id", data.scanId)
      .maybeSingle();

    if (error || !scan) throw new Error("Scan not found.");

    const [
      { data: score },
      { data: competitors },
      { data: sources },
      { data: recommendations },
      { data: audit },
      { data: version },
    ] = await Promise.all([
      context.supabase
        .from("score_snapshots")
        .select("*")
        .eq("scan_id", scan.id)
        .order("created_at", { ascending: false })
        .limit(1),
      context.supabase
        .from("detected_competitors")
        .select("*")
        .eq("scan_id", scan.id)
        .order("mention_count", { ascending: false }),
      context.supabase
        .from("run_sources")
        .select("id,url,host,title,is_owned_domain")
        .eq("scan_id", scan.id)
        .limit(200),
      context.supabase
        .from("recommendations")
        .select("*")
        .eq("scan_id", scan.id)
        .order("priority", { ascending: false }),
      context.supabase
        .from("site_audits")
        .select("*")
        .eq("scan_id", scan.id)
        .order("created_at", { ascending: false })
        .limit(1),
      context.supabase
        .from("report_versions")
        .select("*")
        .eq("scan_id", scan.id)
        .order("version", { ascending: false })
        .limit(1),
    ]);

    return {
      scan,
      score: score?.[0] ?? null,
      competitors: competitors ?? [],
      sources: sources ?? [],
      recommendations: recommendations ?? [],
      siteAudit: audit?.[0] ?? null,
      reportVersion: version?.[0] ?? null,
    };
  });
