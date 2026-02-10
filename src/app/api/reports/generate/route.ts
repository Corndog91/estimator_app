import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, reportType } = body;

  if (!projectId || !reportType) {
    return NextResponse.json({ error: "projectId and reportType required" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Create report record — PDF rendering via @react-pdf/renderer
  // and R2 upload will be added when storage is configured
  const report = await prisma.report.create({
    data: {
      projectId,
      reportType: reportType as "PROPOSAL" | "PACKAGE" | "COST_SUMMARY",
      fileUrl: null,
    },
  });

  return NextResponse.json(report, { status: 201 });
}
