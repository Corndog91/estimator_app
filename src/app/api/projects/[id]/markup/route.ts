import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasProjectAccess } from "@/lib/project-access";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await hasProjectAccess(session, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await req.json();
  const data: {
    overhead?: number;
    profit?: number;
    bond?: number;
    tax?: number;
    mobilization?: number;
    insuranceRate?: number;
  } = {};

  if ("overhead" in body && typeof body.overhead === "number") data.overhead = body.overhead;
  if ("profit" in body && typeof body.profit === "number") data.profit = body.profit;
  if ("bond" in body && typeof body.bond === "number") data.bond = body.bond;
  if ("tax" in body && typeof body.tax === "number") data.tax = body.tax;
  if ("mobilization" in body && typeof body.mobilization === "number") data.mobilization = body.mobilization;
  if ("insuranceRate" in body && typeof body.insuranceRate === "number") data.insuranceRate = body.insuranceRate;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  const markupConfig = await prisma.markupConfig.upsert({
    where: { projectId: id },
    update: data,
    create: { projectId: id, ...data },
  });

  return NextResponse.json(markupConfig);
}
