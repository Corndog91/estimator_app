import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ sectionId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sectionId } = await params;
  const body = await req.json();

  const section = await prisma.bidSection.update({
    where: { id: sectionId },
    data: body,
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(section);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ sectionId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sectionId } = await params;
  await prisma.bidSection.delete({ where: { id: sectionId } });
  return NextResponse.json({ success: true });
}
