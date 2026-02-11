import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/calculations";
import { Plus, Search } from "lucide-react";
import { ProjectFilters } from "@/components/project/project-filters";
import { DeleteProjectButton } from "@/components/project/delete-project-button";
import { projectScopeWhere } from "@/lib/project-access";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const scopeWhere = projectScopeWhere(session);

  const params = await searchParams;

  const projects = await prisma.project.findMany({
    where: {
      ...scopeWhere,
      ...(params.status && params.status !== "ALL" ? { status: params.status as "DRAFT" | "IN_PROGRESS" | "REVIEW" | "COMPLETE" | "ARCHIVED" } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { projectNumber: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      bidSections: {
        include: { lineItems: { select: { totalCost: true } } },
      },
    },
  });

  return (
    <div className="container py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <ProjectFilters />

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">No projects found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or create a new project</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => {
            const total = project.bidSections.reduce(
              (sum, s) => sum + s.lineItems.reduce((iSum, li) => iSum + li.totalCost, 0),
              0
            );
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-muted-foreground">{project.projectNumber}</span>
                        <span className="font-semibold">{project.name}</span>
                        <StatusBadge status={project.status} />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{project.createdBy.name}</span>
                        <span>&middot;</span>
                        <span>{project.bidSections.length} sections</span>
                        <span>&middot;</span>
                        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold tabular-nums">{formatCurrency(total)}</p>
                        <p className="text-xs text-muted-foreground">Bid Total</p>
                      </div>
                      <DeleteProjectButton
                        projectId={project.id}
                        projectName={project.name}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
