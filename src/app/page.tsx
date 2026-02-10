import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/calculations";
import { Plus, FolderOpen, DollarSign, Clock, CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [projects, stats] = await Promise.all([
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        createdBy: { select: { name: true } },
        bidSections: {
          include: { lineItems: { select: { totalCost: true } } },
        },
      },
    }),
    prisma.project.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const totalProjects = stats.reduce((sum, s) => sum + s._count, 0);
  const activeProjects = stats.find((s) => s.status === "IN_PROGRESS")?._count ?? 0;
  const completeProjects = stats.find((s) => s.status === "COMPLETE")?._count ?? 0;

  const totalBidValue = projects.reduce((sum, p) => {
    const projectTotal = p.bidSections.reduce(
      (sectionSum, s) => sectionSum + s.lineItems.reduce((itemSum, li) => itemSum + li.totalCost, 0),
      0
    );
    return sum + projectTotal;
  }, 0);

  return (
    <div className="container py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.name}</p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalProjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeProjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Complete</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completeProjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bid Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalBidValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Your most recently updated projects</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">No projects yet</h3>
              <p className="text-muted-foreground mb-4">Create your first earthwork takeoff project</p>
              <Link href="/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => {
                const projectTotal = project.bidSections.reduce(
                  (sum, s) => sum + s.lineItems.reduce((itemSum, li) => itemSum + li.totalCost, 0),
                  0
                );
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">{project.projectNumber}</span>
                        <span className="font-medium">{project.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{project.createdBy.name}</span>
                        <span>&middot;</span>
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium tabular-nums">{formatCurrency(projectTotal)}</span>
                      <StatusBadge status={project.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
