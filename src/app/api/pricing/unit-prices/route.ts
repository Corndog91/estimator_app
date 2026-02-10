import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const unitPrices = await prisma.unitPrice.findMany({
    where: {
      ...(category ? { category: category as "BUILDING_PAD" | "PAVING" | "PONDS" | "SITE_CLEARING" | "EROSION" | "UTILITIES" | "TRUCKING" | "MISC" } : {}),
    },
    orderBy: [{ category: "asc" }, { description: "asc" }],
  });

  return NextResponse.json(unitPrices);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const unitPrice = await prisma.unitPrice.create({
    data: {
      category: body.category,
      description: body.description || "",
      unit: body.unit || "",
      unitPrice: body.unitPrice || 0,
      crewCost: body.crewCost || 0,
      productionRate: body.productionRate || 0,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(unitPrice, { status: 201 });
}
