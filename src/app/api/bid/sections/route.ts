import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasProjectAccess } from "@/lib/project-access";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, name, sectionType } = body;
  if (!projectId || !(await hasProjectAccess(session, projectId))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  const parsedSectionType:
    | "BUILDING_PAD"
    | "PAVING"
    | "PONDS"
    | "SITE_CLEARING"
    | "EROSION"
    | "UTILITIES"
    | "TRUCKING"
    | "MISC" =
    typeof sectionType === "string" &&
    ["BUILDING_PAD", "PAVING", "PONDS", "SITE_CLEARING", "EROSION", "UTILITIES", "TRUCKING", "MISC"].includes(sectionType)
      ? (sectionType as
          | "BUILDING_PAD"
          | "PAVING"
          | "PONDS"
          | "SITE_CLEARING"
          | "EROSION"
          | "UTILITIES"
          | "TRUCKING"
          | "MISC")
      : "MISC";

  const maxOrder = await prisma.bidSection.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });

  const section = await prisma.bidSection.create({
    data: {
      projectId,
      name: typeof name === "string" && name.trim() ? name : "New Section",
      sectionType: parsedSectionType,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
    include: { lineItems: true },
  });

  return NextResponse.json(section, { status: 201 });
}
