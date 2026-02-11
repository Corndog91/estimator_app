import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProjectSidebar } from "@/components/project/project-sidebar";
import { StatusBadge } from "@/components/shared/status-badge";
import { projectScopeWhere } from "@/lib/project-access";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const scopeWhere = projectScopeWhere(session);

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, ...scopeWhere },
    select: { id: true, name: true, projectNumber: true, status: true },
  });

  if (!project) notFound();

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="border-b px-6 py-3 flex items-center gap-4 bg-background">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-muted-foreground">{project.projectNumber}</span>
          <h2 className="font-semibold text-lg">{project.name}</h2>
          <StatusBadge status={project.status} />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar projectId={project.id} />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}
