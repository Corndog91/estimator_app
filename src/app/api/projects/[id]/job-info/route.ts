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
  const data: Record<string, unknown> = {};

  const stringFields = [
    "owner",
    "architect",
    "engineer",
    "generalContractor",
    "projectLocation",
    "technicianName",
    "notes",
  ] as const;
  for (const field of stringFields) {
    if (field in body) {
      if (typeof body[field] === "string") data[field] = body[field];
      if (body[field] === null) data[field] = null;
    }
  }

  const dateFields = ["planDate", "specDate"] as const;
  for (const field of dateFields) {
    if (field in body) data[field] = body[field] ?? null;
  }

  const boolFields = [
    "retainingWalls",
    "trenchSafety",
    "geotextile",
    "underdrains",
    "erosionControl",
    "demolition",
    "stormDrainage",
    "sanitarySewer",
    "waterLine",
    "gasLine",
    "electricConduit",
    "siteLighting",
    "landscaping",
    "irrigation",
    "fencing",
    "signage",
  ] as const;
  for (const field of boolFields) {
    if (field in body && typeof body[field] === "boolean") data[field] = body[field];
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  const jobInfo = await prisma.jobInfo.upsert({
    where: { projectId: id },
    update: data,
    create: { ...data, projectId: id },
  });

  return NextResponse.json(jobInfo);
}
