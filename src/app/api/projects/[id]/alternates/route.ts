import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sections = await prisma.alternateSection.findMany({
    where: { projectId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(sections);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const maxOrder = await prisma.alternateSection.aggregate({
    where: { projectId: id },
    _max: { sortOrder: true },
  });

  const section = await prisma.alternateSection.create({
    data: {
      projectId: id,
      name: body.name || "New Alternate",
      description: body.description,
      addDeduct: body.addDeduct || "ADD",
      amount: body.amount || 0,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(section, { status: 201 });
}
