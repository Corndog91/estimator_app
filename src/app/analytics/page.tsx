import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { BarChart3, TrendingUp, DollarSign, Layers } from "lucide-react";
import { projectScopeWhere } from "@/lib/project-access";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const scopeWhere = projectScopeWhere(session);

  const projects = await prisma.project.findMany({
    where: { ...scopeWhere, status: { not: "ARCHIVED" } },
    include: {
      bidSections: {
        include: { lineItems: { select: { totalCost: true, quantity: true, unit: true } } },
      },
      markupConfig: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalBidValue = projects.reduce(
    (sum, p) => sum + p.bidSections.reduce(
      (sSum, s) => sSum + s.lineItems.reduce((iSum, li) => iSum + li.totalCost, 0), 0
    ), 0
  );

  const totalCY = projects.reduce(
    (sum, p) => sum + p.bidSections.reduce(
      (sSum, s) => sSum + s.lineItems
        .filter((li) => li.unit === "CY")
        .reduce((iSum, li) => iSum + li.quantity, 0), 0
    ), 0
  );

  const avgProjectValue = projects.length > 0 ? totalBidValue / projects.length : 0;

  return (
    <div className="container py-8 px-4 space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bid Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalBidValue)}</p>
            <p className="text-xs text-muted-foreground">Across {projects.length} projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Project Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(avgProjectValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
            <Layers className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCY.toLocaleString()} CY</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg $/CY</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalCY > 0 ? formatCurrency(totalBidValue / totalCY) : "$0.00"}
            </p>
            <p className="text-xs text-muted-foreground">Cost per cubic yard</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Comparison</CardTitle>
          <CardDescription>All active projects sorted by value</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No projects to analyze.</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => {
                const projectTotal = project.bidSections.reduce(
                  (sum, s) => sum + s.lineItems.reduce((iSum, li) => iSum + li.totalCost, 0), 0
                );
                const maxTotal = Math.max(...projects.map((p) =>
                  p.bidSections.reduce((sum, s) => sum + s.lineItems.reduce((iSum, li) => iSum + li.totalCost, 0), 0)
                ), 1);
                const widthPct = (projectTotal / maxTotal) * 100;

                return (
                  <div key={project.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{project.projectNumber} — {project.name}</span>
                      <span className="tabular-nums font-medium">{formatCurrency(projectTotal)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
