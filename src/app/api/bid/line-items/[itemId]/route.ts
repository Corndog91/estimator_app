import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAccessibleLineItem } from "@/lib/project-access";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;
  const lineItemAccess = await getAccessibleLineItem(session, itemId);
  if (!lineItemAccess) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const data: {
    description?: string;
    quantity?: number;
    unit?: string;
    unitPrice?: number;
    crewCost?: number;
    productionRate?: number;
    notes?: string | null;
    sortOrder?: number;
  } = {};

  if ("description" in body) data.description = typeof body.description === "string" ? body.description : "";
  if ("quantity" in body && typeof body.quantity === "number") data.quantity = body.quantity;
  if ("unit" in body) data.unit = typeof body.unit === "string" ? body.unit : "";
  if ("unitPrice" in body && typeof body.unitPrice === "number") data.unitPrice = body.unitPrice;
  if ("crewCost" in body && typeof body.crewCost === "number") data.crewCost = body.crewCost;
  if ("productionRate" in body && typeof body.productionRate === "number") data.productionRate = body.productionRate;
  if ("notes" in body) {
    if (typeof body.notes === "string") data.notes = body.notes;
    if (body.notes === null) data.notes = null;
  }
  if ("sortOrder" in body && typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  // Recalculate computed fields if quantity or unitPrice changed
  const current = await prisma.lineItem.findUnique({ where: { id: itemId } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const quantity = data.quantity ?? current.quantity;
  const unitPrice = data.unitPrice ?? current.unitPrice;
  const productionRate = data.productionRate ?? current.productionRate;

  const totalCost = quantity * unitPrice;
  const days = productionRate > 0 ? quantity / productionRate : 0;

  const lineItem = await prisma.lineItem.update({
    where: { id: itemId },
    data: {
      ...data,
      totalCost,
      days,
    },
  });

  return NextResponse.json(lineItem);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;
  const lineItemAccess = await getAccessibleLineItem(session, itemId);
  if (!lineItemAccess) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.lineItem.delete({ where: { id: itemId } });
  return NextResponse.json({ success: true });
}
