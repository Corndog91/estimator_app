import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.defaultTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  });

  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const template = await prisma.defaultTemplate.create({
    data: {
      name: body.name,
      description: body.description,
      defaultLineItems: body.defaultLineItems,
      defaultMarkup: body.defaultMarkup,
      defaultCalculatorInputs: body.defaultCalculatorInputs,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
