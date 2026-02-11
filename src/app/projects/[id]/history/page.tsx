import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { projectScopeWhere } from "@/lib/project-access";

export default async function HistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  const scopeWhere = projectScopeWhere(session);

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, ...scopeWhere },
    select: { createdAt: true, updatedAt: true, status: true },
  });

  if (!project) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <h3 className="text-xl font-semibold">Project History</h3>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-medium">Project Created</p>
                <p className="text-xs text-muted-foreground">{new Date(project.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-xs text-muted-foreground">{new Date(project.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-orange-500" />
              <div>
                <p className="text-sm font-medium">Current Status: {project.status.replace("_", " ")}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-6 pt-4 border-t">
            Detailed audit logging will track all changes to line items, markup configurations, and project data. Coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
