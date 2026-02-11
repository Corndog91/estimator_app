import type { Session } from "next-auth";
import { prisma } from "@/lib/db";

export function isAdminSession(session: Session | null): boolean {
  return session?.user?.role === "ADMIN";
}

export function projectScopeWhere(session: Session): { createdById?: string } {
  if (isAdminSession(session)) return {};
  return { createdById: session.user.id };
}

export async function hasProjectAccess(session: Session, projectId: string): Promise<boolean> {
  if (isAdminSession(session)) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    return !!project;
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, createdById: session.user.id },
    select: { id: true },
  });
  return !!project;
}

export async function getAccessibleBidSection(
  session: Session,
  sectionId: string
): Promise<{ id: string; projectId: string } | null> {
  if (isAdminSession(session)) {
    return prisma.bidSection.findUnique({
      where: { id: sectionId },
      select: { id: true, projectId: true },
    });
  }

  return prisma.bidSection.findFirst({
    where: {
      id: sectionId,
      project: { createdById: session.user.id },
    },
    select: { id: true, projectId: true },
  });
}

export async function getAccessibleLineItem(
  session: Session,
  itemId: string
): Promise<{ id: string; bidSectionId: string; bidSection: { projectId: string } } | null> {
  if (isAdminSession(session)) {
    return prisma.lineItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        bidSectionId: true,
        bidSection: { select: { projectId: true } },
      },
    });
  }

  return prisma.lineItem.findFirst({
    where: {
      id: itemId,
      bidSection: { project: { createdById: session.user.id } },
    },
    select: {
      id: true,
      bidSectionId: true,
      bidSection: { select: { projectId: true } },
    },
  });
}

export async function getAccessibleAlternate(
  session: Session,
  alternateId: string
): Promise<{ id: string; projectId: string } | null> {
  if (isAdminSession(session)) {
    return prisma.alternateSection.findUnique({
      where: { id: alternateId },
      select: { id: true, projectId: true },
    });
  }

  return prisma.alternateSection.findFirst({
    where: {
      id: alternateId,
      project: { createdById: session.user.id },
    },
    select: { id: true, projectId: true },
  });
}

export async function getAccessibleCostWriteUpItem(
  session: Session,
  itemId: string
): Promise<{ id: string; projectId: string } | null> {
  if (isAdminSession(session)) {
    return prisma.costWriteUpItem.findUnique({
      where: { id: itemId },
      select: { id: true, projectId: true },
    });
  }

  return prisma.costWriteUpItem.findFirst({
    where: {
      id: itemId,
      project: { createdById: session.user.id },
    },
    select: { id: true, projectId: true },
  });
}
