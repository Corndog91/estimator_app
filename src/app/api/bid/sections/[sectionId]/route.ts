import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAccessibleBidSection } from "@/lib/project-access";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ sectionId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sectionId } = await params;
  const sectionAccess = await getAccessibleBidSection(session, sectionId);
  if (!sectionAccess) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const data: {
    name?: string;
    sectionType?: "BUILDING_PAD" | "PAVING" | "PONDS" | "SITE_CLEARING" | "EROSION" | "UTILITIES" | "TRUCKING" | "MISC";
    sortOrder?: number;
  } = {};

  if ("name" in body) data.name = typeof body.name === "string" ? body.name : "";
  if (
    "sectionType" in body &&
    ["BUILDING_PAD", "PAVING", "PONDS", "SITE_CLEARING", "EROSION", "UTILITIES", "TRUCKING", "MISC"].includes(body.sectionType)
  ) {
    data.sectionType = body.sectionType;
  }
  if ("sortOrder" in body && typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  const section = await prisma.bidSection.update({
    where: { id: sectionId },
    data,
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(section);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ sectionId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sectionId } = await params;
  const sectionAccess = await getAccessibleBidSection(session, sectionId);
  if (!sectionAccess) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.bidSection.delete({ where: { id: sectionId } });
  return NextResponse.json({ success: true });
}
