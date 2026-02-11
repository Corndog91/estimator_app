import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasProjectAccess, projectScopeWhere } from "@/lib/project-access";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: {
      id,
      ...projectScopeWhere(session),
    },
    include: {
      createdBy: { select: { name: true } },
      jobInfo: true,
      bidSections: {
        orderBy: { sortOrder: "asc" },
        include: {
          lineItems: { orderBy: { sortOrder: "asc" } },
        },
      },
      buildingPadDesigns: true,
      pavingDesigns: true,
      pondDesigns: true,
      costWriteUpItems: { orderBy: { sortOrder: "asc" } },
      markupConfig: { include: { lineItems: { orderBy: { sortOrder: "asc" } } } },
      calculatorSnapshots: true,
      alternateSections: { orderBy: { sortOrder: "asc" } },
      reports: { orderBy: { generatedAt: "desc" } },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await hasProjectAccess(session, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await req.json();
  const data: {
    projectNumber?: string;
    name?: string;
    status?: "DRAFT" | "IN_PROGRESS" | "REVIEW" | "COMPLETE" | "ARCHIVED";
  } = {};

  if ("projectNumber" in body) data.projectNumber = typeof body.projectNumber === "string" ? body.projectNumber : "";
  if ("name" in body) data.name = typeof body.name === "string" ? body.name : "";
  if ("status" in body && ["DRAFT", "IN_PROGRESS", "REVIEW", "COMPLETE", "ARCHIVED"].includes(body.status)) {
    data.status = body.status;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  const project = await prisma.project.update({
    where: { id },
    data,
  });

  return NextResponse.json(project);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await hasProjectAccess(session, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
