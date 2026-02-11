import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasProjectAccess } from "@/lib/project-access";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await hasProjectAccess(session, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const snapshots = await prisma.calculatorSnapshot.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(snapshots);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await hasProjectAccess(session, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await req.json();
  if (!["HAUL_TRUCK", "EXCAVATION_CREW", "COMPACTION", "IMPORT_EXPORT"].includes(body.calculatorType)) {
    return NextResponse.json({ error: "Invalid calculatorType" }, { status: 400 });
  }
  if (typeof body.inputs !== "object" || body.inputs === null || typeof body.outputs !== "object" || body.outputs === null) {
    return NextResponse.json({ error: "inputs and outputs must be objects" }, { status: 400 });
  }

  const snapshot = await prisma.calculatorSnapshot.create({
    data: {
      projectId: id,
      calculatorType: body.calculatorType,
      name: typeof body.name === "string" ? body.name : "",
      inputs: body.inputs,
      outputs: body.outputs,
    },
  });

  return NextResponse.json(snapshot, { status: 201 });
}
