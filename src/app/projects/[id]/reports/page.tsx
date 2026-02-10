"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  reportType: string;
  fileUrl: string | null;
  generatedAt: string;
}

const reportTypes = [
  { type: "PROPOSAL", label: "Proposal", description: "Client-facing proposal with scope and pricing" },
  { type: "PACKAGE", label: "Bid Package", description: "Complete bid package with all sections and details" },
  { type: "COST_SUMMARY", label: "Cost Summary", description: "Internal cost summary with markup breakdown" },
];

export default function ReportsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((project) => {
        setReports(project.reports || []);
        setLoaded(true);
      });
  }, [projectId]);

  const generateReport = useCallback(async (reportType: string) => {
    setGenerating(reportType);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, reportType }),
      });
      if (res.ok) {
        const report = await res.json();
        setReports((prev) => [report, ...prev]);
        toast({ title: "Report Generated", description: `${reportType} report is ready for download.` });
      } else {
        toast({ title: "Error", description: "Failed to generate report.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate report.", variant: "destructive" });
    }
    setGenerating(null);
  }, [projectId, toast]);

  if (!loaded) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <h3 className="text-xl font-semibold">Reports</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map(({ type, label, description }) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {label}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => generateReport(type)}
                disabled={generating === type}
              >
                {generating === type ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Generate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{report.reportType.replace("_", " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.generatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {report.fileUrl ? (
                    <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </a>
                  ) : (
                    <Badge variant="secondary">Processing</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
