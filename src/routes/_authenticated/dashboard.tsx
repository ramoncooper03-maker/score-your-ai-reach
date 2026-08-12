import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Building2, Plus } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getWorkspace, startScan } from "@/lib/app.functions";
import { TERMINAL_STATUSES } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LocalAI Score" },
      { name: "description", content: "Your businesses, scans and AI visibility reports." },
      { property: "og:title", content: "Dashboard — LocalAI Score" },
      { property: "og:description", content: "Track scans and reports for the businesses you measure." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function statusVariant(status: string) {
  if (status === "complete") return "default" as const;
  if (status === "failed" || status === "refund_review") return "destructive" as const;
  if (status === "partial") return "outline" as const;
  return "secondary" as const;
}

function DashboardPage() {
  const fetchWorkspace = useServerFn(getWorkspace);
  const requestScan = useServerFn(startScan);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const workspace = useQuery({
    queryKey: ["workspace"],
    queryFn: () => fetchWorkspace(),
  });

  const scanMutation = useMutation({
    mutationFn: (businessId: string) => requestScan({ data: { businessId, scanType: "standard" } }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success(result.created ? "Scan started." : "Reusing today's scan for this business.");
      void navigate({ to: "/scans/$scanId", params: { scanId: result.scanId } });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not start the scan."),
  });

  const businesses = workspace.data?.businesses ?? [];
  const scans = workspace.data?.scans ?? [];

  return (
    <DashboardShell
      title="Overview"
      description="Each scan runs the same standardized buyer-intent tests, so results stay comparable over time."
      actions={
        <Button asChild>
          <Link to="/onboarding">
            <Plus className="mr-1 h-4 w-4" />
            Add business
          </Link>
        </Button>
      }
    >
      {workspace.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : workspace.isError ? (
        <Card>
          <CardContent className="p-8 text-sm text-destructive">Could not load your workspace. Please refresh.</CardContent>
        </Card>
      ) : businesses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-start gap-4 p-10">
            <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold text-ink">Add your first business</h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                We need your business name, website, category, city, state and primary services to build the
                standardized test set.
              </p>
            </div>
            <Button asChild>
              <Link to="/onboarding">
                Start intake
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Businesses</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {businesses.map((business) => (
                <Card key={business.id} className="border-border/80 shadow-card">
                  <CardContent className="p-6">
                    <h3 className="text-base font-semibold text-ink">{business.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {business.category} · {business.city}, {business.state}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{business.website_host ?? business.website}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {business.primary_services.slice(0, 4).map((service) => (
                        <Badge key={service} variant="secondary" className="font-normal">
                          {service}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      className="mt-6"
                      size="sm"
                      disabled={scanMutation.isPending}
                      onClick={() => scanMutation.mutate(business.id)}
                    >
                      Run scan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recent scans</h2>
            {scans.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No scans yet.</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-surface text-left text-xs uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Business</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Requested</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {scans.map((scan) => {
                      const business = businesses.find((item) => item.id === scan.business_id);
                      const terminal = (TERMINAL_STATUSES as readonly string[]).includes(scan.status);
                      return (
                        <tr key={scan.id} className="border-b border-border last:border-0">
                          <td className="px-5 py-4 text-ink">{business?.name ?? "—"}</td>
                          <td className="px-5 py-4">
                            <Badge variant={statusVariant(scan.status)}>{scan.status.replace(/_/g, " ")}</Badge>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {new Date(scan.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link
                                to={terminal ? "/reports/$scanId" : "/scans/$scanId"}
                                params={{ scanId: scan.id }}
                              >
                                {terminal ? "View report" : "View status"}
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
