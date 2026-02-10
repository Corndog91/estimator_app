import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { calculateMarkupTotal } from "@/lib/calculations";
import { Layers, DollarSign, Clock, FileText } from "lucide-react";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      jobInfo: true,
      bidSections: {
        include: { lineItems: true },
      },
      markupConfig: true,
      reports: { orderBy: { generatedAt: "desc" }, take: 5 },
    },
  });

  if (!project) notFound();

  const bidTotal = project.bidSections.reduce(
    (sum, s) => sum + s.lineItems.reduce((iSum, li) => iSum + li.totalCost, 0),
    0
  );

  const totalDays = project.bidSections.reduce(
    (sum, s) => sum + s.lineItems.reduce((iSum, li) => iSum + li.days, 0),
    0
  );

  const totalLineItems = project.bidSections.reduce((sum, s) => sum + s.lineItems.length, 0);

  const markupTotal = project.markupConfig
    ? calculateMarkupTotal(bidTotal, {
        overhead: project.markupConfig.overhead,
        profit: project.markupConfig.profit,
        bond: project.markupConfig.bond,
        tax: project.markupConfig.tax,
        mobilization: project.markupConfig.mobilization,
      })
    : bidTotal;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Project Overview</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bid Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(bidTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With Markup</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(markupTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sections / Items</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {project.bidSections.length} / {totalLineItems}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Est. Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{Math.ceil(totalDays)} days</p>
          </CardContent>
        </Card>
      </div>

      {/* Sections Summary */}
      <Card>
        <CardHeader>
          <CardTitle>BID Sections</CardTitle>
        </CardHeader>
        <CardContent>
          {project.bidSections.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No bid sections yet. Go to BID Sections to add them.</p>
          ) : (
            <div className="space-y-2">
              {project.bidSections.map((section) => {
                const sectionTotal = section.lineItems.reduce((sum, li) => sum + li.totalCost, 0);
                return (
                  <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{section.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {section.lineItems.length} items &middot; {section.sectionType.replace("_", " ")}
                      </p>
                    </div>
                    <p className="font-medium tabular-nums">{formatCurrency(sectionTotal)}</p>
                  </div>
                );
              })}
              <div className="flex items-center justify-between p-3 border-t-2 font-semibold">
                <span>Grand Total</span>
                <span className="tabular-nums">{formatCurrency(bidTotal)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Info Summary */}
      {project.jobInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Job Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {project.jobInfo.owner && (
                <div><span className="text-muted-foreground">Owner:</span> {project.jobInfo.owner}</div>
              )}
              {project.jobInfo.architect && (
                <div><span className="text-muted-foreground">Architect:</span> {project.jobInfo.architect}</div>
              )}
              {project.jobInfo.engineer && (
                <div><span className="text-muted-foreground">Engineer:</span> {project.jobInfo.engineer}</div>
              )}
              {project.jobInfo.generalContractor && (
                <div><span className="text-muted-foreground">GC:</span> {project.jobInfo.generalContractor}</div>
              )}
              {project.jobInfo.projectLocation && (
                <div className="col-span-2"><span className="text-muted-foreground">Location:</span> {project.jobInfo.projectLocation}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
