import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, name, sectionType } = body;

  const maxOrder = await prisma.bidSection.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });

  const section = await prisma.bidSection.create({
    data: {
      projectId,
      name,
      sectionType: sectionType || "MISC",
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
    include: { lineItems: true },
  });

  return NextResponse.json(section, { status: 201 });
}
