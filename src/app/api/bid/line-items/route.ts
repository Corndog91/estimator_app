import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { bidSectionId, description, quantity, unit, unitPrice, crewCost, productionRate } = body;

  const maxOrder = await prisma.lineItem.aggregate({
    where: { bidSectionId },
    _max: { sortOrder: true },
  });

  const totalCost = (quantity || 0) * (unitPrice || 0);
  const days = productionRate ? (quantity || 0) / productionRate : 0;

  const lineItem = await prisma.lineItem.create({
    data: {
      bidSectionId,
      description: description || "New Item",
      quantity: quantity || 0,
      unit: unit || "",
      unitPrice: unitPrice || 0,
      crewCost: crewCost || 0,
      productionRate: productionRate || 0,
      days,
      totalCost,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(lineItem, { status: 201 });
}
