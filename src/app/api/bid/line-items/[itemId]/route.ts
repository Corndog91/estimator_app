import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;
  const body = await req.json();

  // Recalculate computed fields if quantity or unitPrice changed
  const current = await prisma.lineItem.findUnique({ where: { id: itemId } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const quantity = body.quantity ?? current.quantity;
  const unitPrice = body.unitPrice ?? current.unitPrice;
  const productionRate = body.productionRate ?? current.productionRate;

  const totalCost = quantity * unitPrice;
  const days = productionRate > 0 ? quantity / productionRate : 0;

  const lineItem = await prisma.lineItem.update({
    where: { id: itemId },
    data: {
      ...body,
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
  await prisma.lineItem.delete({ where: { id: itemId } });
  return NextResponse.json({ success: true });
}
