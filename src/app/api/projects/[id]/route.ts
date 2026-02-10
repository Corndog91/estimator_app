import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
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
  const body = await req.json();

  const project = await prisma.project.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(project);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
