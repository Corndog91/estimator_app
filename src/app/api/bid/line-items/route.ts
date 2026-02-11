import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAccessibleBidSection } from "@/lib/project-access";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { bidSectionId, description, quantity, unit, unitPrice, crewCost, productionRate } = body;
  if (!bidSectionId) {
    return NextResponse.json({ error: "bidSectionId is required" }, { status: 400 });
  }
  const sectionAccess = await getAccessibleBidSection(session, bidSectionId);
  if (!sectionAccess) return NextResponse.json({ error: "Section not found" }, { status: 404 });

  const maxOrder = await prisma.lineItem.aggregate({
    where: { bidSectionId },
    _max: { sortOrder: true },
  });

  const parsedQuantity = typeof quantity === "number" ? quantity : 0;
  const parsedUnitPrice = typeof unitPrice === "number" ? unitPrice : 0;
  const parsedCrewCost = typeof crewCost === "number" ? crewCost : 0;
  const parsedProductionRate = typeof productionRate === "number" ? productionRate : 0;

  const totalCost = parsedQuantity * parsedUnitPrice;
  const days = parsedProductionRate > 0 ? parsedQuantity / parsedProductionRate : 0;

  const lineItem = await prisma.lineItem.create({
    data: {
      bidSectionId,
      description: typeof description === "string" && description.trim() ? description : "New Item",
      quantity: parsedQuantity,
      unit: typeof unit === "string" ? unit : "",
      unitPrice: parsedUnitPrice,
      crewCost: parsedCrewCost,
      productionRate: parsedProductionRate,
      days,
      totalCost,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(lineItem, { status: 201 });
}
