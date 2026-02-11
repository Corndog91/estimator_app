import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAccessibleCostWriteUpItem } from "@/lib/project-access";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId, itemId } = await params;
  const itemAccess = await getAccessibleCostWriteUpItem(session, itemId);
  if (!itemAccess || itemAccess.projectId !== projectId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: {
    category?: "EQUIPMENT" | "LABOR" | "MATERIAL" | "SUBCONTRACTOR" | "OTHER";
    description?: string;
    totalFromBid?: number;
    adjustedCost?: number;
    notes?: string | null;
    sortOrder?: number;
  } = {};

  if (
    "category" in body &&
    ["EQUIPMENT", "LABOR", "MATERIAL", "SUBCONTRACTOR", "OTHER"].includes(body.category)
  ) {
    data.category = body.category;
  }
  if ("description" in body) data.description = typeof body.description === "string" ? body.description : "";
  if ("totalFromBid" in body && typeof body.totalFromBid === "number") data.totalFromBid = body.totalFromBid;
  if ("adjustedCost" in body && typeof body.adjustedCost === "number") data.adjustedCost = body.adjustedCost;
  if ("notes" in body) {
    if (typeof body.notes === "string") data.notes = body.notes;
    if (body.notes === null) data.notes = null;
  }
  if ("sortOrder" in body && typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  const item = await prisma.costWriteUpItem.update({
    where: { id: itemId },
    data,
  });

  return NextResponse.json(item);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId, itemId } = await params;
  const itemAccess = await getAccessibleCostWriteUpItem(session, itemId);
  if (!itemAccess || itemAccess.projectId !== projectId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.costWriteUpItem.delete({ where: { id: itemId } });
  return NextResponse.json({ success: true });
}
