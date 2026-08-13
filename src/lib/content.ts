/**
 * Shared presentation copy. Kept in one place so product claims stay accurate
 * and consistent: AIEO Meter never claims a permanent "ChatGPT ranking"
 * and never promises that optimization will make an AI recommend a business.
 */

export const BRAND = "AIEO Meter";

export const VARIABILITY_DISCLOSURE =
  "AI-generated answers vary between engines, sessions and phrasing. AIEO Meter runs a fixed set of standardized buyer-intent tests and reports what those tests observed at a point in time. It is not a permanent AI ranking and no result can be guaranteed.";

export const SCAN_STEPS = [
  { status: "validating", label: "Checking your business details" },
  { status: "crawling", label: "Reading your website" },
  { status: "profile_ready", label: "Business identified" },
  { status: "generating_queries", label: "Building your discovery questions" },
  { status: "running_tests", label: "Asking the AI engines" },
  { status: "normalizing_entities", label: "Finding competitors" },
  { status: "calculating_scores", label: "Calculating your AIEO Meter" },
  { status: "generating_recommendations", label: "Working out what to fix" },
  { status: "rendering_report", label: "Building your report" },
  { status: "complete", label: "Your AIEO Meter is ready" },
] as const;

export const TERMINAL_STATUSES = ["complete", "partial", "failed", "refund_review"] as const;

export const REPORT_SECTIONS = [
  "Executive summary",
  "AI Visibility Score",
  "AI Readiness Score",
  "Methodology",
  "AI engine breakdown",
  "Competitive share of voice",
  "Observed competitors",
  "Query wins",
  "Query losses",
  "Sources & citations",
  "Website readiness findings",
  "Prioritized recommendations",
  "30-day action plan",
  "Methodology disclosure",
] as const;
