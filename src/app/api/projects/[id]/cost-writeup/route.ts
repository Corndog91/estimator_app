import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
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
  const body = await req.json();

  const maxOrder = await prisma.costWriteUpItem.aggregate({
    where: { projectId: id },
    _max: { sortOrder: true },
  });

  const item = await prisma.costWriteUpItem.create({
    data: {
      projectId: id,
      category: body.category || "OTHER",
      description: body.description || "New Item",
      totalFromBid: body.totalFromBid || 0,
      adjustedCost: body.adjustedCost || 0,
      notes: body.notes,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
