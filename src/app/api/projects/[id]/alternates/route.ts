import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasProjectAccess } from "@/lib/project-access";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await hasProjectAccess(session, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
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
  if (!(await hasProjectAccess(session, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await req.json();

  const maxOrder = await prisma.alternateSection.aggregate({
    where: { projectId: id },
    _max: { sortOrder: true },
  });

  const section = await prisma.alternateSection.create({
    data: {
      projectId: id,
      name: typeof body.name === "string" && body.name.trim() ? body.name : "New Alternate",
      description: typeof body.description === "string" ? body.description : null,
      addDeduct: body.addDeduct === "DEDUCT" ? "DEDUCT" : "ADD",
      amount: typeof body.amount === "number" ? body.amount : 0,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(section, { status: 201 });
}
