import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const projects = await prisma.project.findMany({
    where: {
      ...(status && status !== "ALL" ? { status: status as "DRAFT" | "IN_PROGRESS" | "REVIEW" | "COMPLETE" | "ARCHIVED" } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { projectNumber: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      bidSections: {
        include: { lineItems: { select: { totalCost: true } } },
      },
    },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectNumber, name, templateId } = body;

  if (!projectNumber || !name) {
    return NextResponse.json({ error: "Project number and name are required" }, { status: 400 });
  }

  let templateData = {};
  if (templateId) {
    const template = await prisma.defaultTemplate.findUnique({ where: { id: templateId } });
    if (template) {
      // Apply template defaults
      templateData = {
        markupConfig: template.defaultMarkup ? {
          create: template.defaultMarkup as Record<string, unknown>,
        } : undefined,
      };
    }
  }

  const project = await prisma.project.create({
    data: {
      projectNumber,
      name,
      createdById: session.user.id,
      jobInfo: { create: {} },
      markupConfig: { create: { overhead: 10, profit: 10, bond: 2 } },
      ...templateData,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
