import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
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
  const body = await req.json();

  const snapshot = await prisma.calculatorSnapshot.create({
    data: {
      projectId: id,
      calculatorType: body.calculatorType,
      name: body.name || "",
      inputs: body.inputs,
      outputs: body.outputs,
    },
  });

  return NextResponse.json(snapshot, { status: 201 });
}
