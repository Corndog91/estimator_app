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
  const items = await prisma.costWriteUpItem.findMany({
    where: { projectId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await hasProjectAccess(session, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await req.json();

  const maxOrder = await prisma.costWriteUpItem.aggregate({
    where: { projectId: id },
    _max: { sortOrder: true },
  });

  const item = await prisma.costWriteUpItem.create({
    data: {
      projectId: id,
      category:
        typeof body.category === "string" &&
        ["EQUIPMENT", "LABOR", "MATERIAL", "SUBCONTRACTOR", "OTHER"].includes(body.category)
          ? body.category
          : "OTHER",
      description: typeof body.description === "string" && body.description.trim() ? body.description : "New Item",
      totalFromBid: typeof body.totalFromBid === "number" ? body.totalFromBid : 0,
      adjustedCost: typeof body.adjustedCost === "number" ? body.adjustedCost : 0,
      notes: typeof body.notes === "string" ? body.notes : null,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
