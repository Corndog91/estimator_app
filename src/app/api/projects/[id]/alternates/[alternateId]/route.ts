import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAccessibleAlternate } from "@/lib/project-access";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; alternateId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId, alternateId } = await params;
  const alternateAccess = await getAccessibleAlternate(session, alternateId);
  if (!alternateAccess || alternateAccess.projectId !== projectId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: {
    name?: string;
    description?: string | null;
    addDeduct?: "ADD" | "DEDUCT";
    amount?: number;
    sortOrder?: number;
  } = {};

  if ("name" in body) data.name = typeof body.name === "string" ? body.name : "";
  if ("description" in body) {
    if (typeof body.description === "string") data.description = body.description;
    if (body.description === null) data.description = null;
  }
  if ("addDeduct" in body && (body.addDeduct === "ADD" || body.addDeduct === "DEDUCT")) {
    data.addDeduct = body.addDeduct;
  }
  if ("amount" in body && typeof body.amount === "number") data.amount = body.amount;
  if ("sortOrder" in body && typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  const alternate = await prisma.alternateSection.update({
    where: { id: alternateId },
    data,
  });

  return NextResponse.json(alternate);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; alternateId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId, alternateId } = await params;
  const alternateAccess = await getAccessibleAlternate(session, alternateId);
  if (!alternateAccess || alternateAccess.projectId !== projectId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.alternateSection.delete({ where: { id: alternateId } });
  return NextResponse.json({ success: true });
}
