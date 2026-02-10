import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const configs = await prisma.defaultPricingConfig.findMany({
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return NextResponse.json(configs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // If marking as default, unset other defaults first
  if (body.isDefault) {
    await prisma.defaultPricingConfig.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  const config = await prisma.defaultPricingConfig.create({
    data: {
      name: body.name || "Default",
      overhead: body.overhead ?? 10,
      profit: body.profit ?? 10,
      bond: body.bond ?? 2,
      tax: body.tax ?? 0,
      mobilization: body.mobilization ?? 0,
      insuranceRate: body.insuranceRate ?? 0,
      isDefault: body.isDefault ?? false,
    },
  });

  return NextResponse.json(config, { status: 201 });
}
