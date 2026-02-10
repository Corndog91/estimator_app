-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ESTIMATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'REVIEW', 'COMPLETE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('BUILDING_PAD', 'PAVING', 'PONDS', 'SITE_CLEARING', 'EROSION', 'UTILITIES', 'TRUCKING', 'MISC');

-- CreateEnum
CREATE TYPE "DesignType" AS ENUM ('BUILDING_PAD', 'PAVING', 'POND');

-- CreateEnum
CREATE TYPE "CutOrFill" AS ENUM ('CUT', 'FILL');

-- CreateEnum
CREATE TYPE "CostCategory" AS ENUM ('EQUIPMENT', 'LABOR', 'MATERIAL', 'SUBCONTRACTOR', 'OTHER');

-- CreateEnum
CREATE TYPE "CalculatorType" AS ENUM ('HAUL_TRUCK', 'EXCAVATION_CREW', 'COMPACTION', 'IMPORT_EXPORT');

-- CreateEnum
CREATE TYPE "AddDeduct" AS ENUM ('ADD', 'DEDUCT');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('PROPOSAL', 'PACKAGE', 'COST_SUMMARY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ESTIMATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "projectNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobInfo" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "owner" TEXT,
    "architect" TEXT,
    "engineer" TEXT,
    "generalContractor" TEXT,
    "projectLocation" TEXT,
    "planDate" TIMESTAMP(3),
    "specDate" TIMESTAMP(3),
    "technicianName" TEXT,
    "notes" TEXT,
    "retainingWalls" BOOLEAN NOT NULL DEFAULT false,
    "trenchSafety" BOOLEAN NOT NULL DEFAULT false,
    "geotextile" BOOLEAN NOT NULL DEFAULT false,
    "underdrains" BOOLEAN NOT NULL DEFAULT false,
    "erosionControl" BOOLEAN NOT NULL DEFAULT false,
    "demolition" BOOLEAN NOT NULL DEFAULT false,
    "stormDrainage" BOOLEAN NOT NULL DEFAULT false,
    "sanitarySewer" BOOLEAN NOT NULL DEFAULT false,
    "waterLine" BOOLEAN NOT NULL DEFAULT false,
    "gasLine" BOOLEAN NOT NULL DEFAULT false,
    "electricConduit" BOOLEAN NOT NULL DEFAULT false,
    "siteLighting" BOOLEAN NOT NULL DEFAULT false,
    "landscaping" BOOLEAN NOT NULL DEFAULT false,
    "irrigation" BOOLEAN NOT NULL DEFAULT false,
    "fencing" BOOLEAN NOT NULL DEFAULT false,
    "signage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BidSection" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "sectionType" "SectionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BidSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItem" (
    "id" TEXT NOT NULL,
    "bidSectionId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT '',
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "crewCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "productionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "days" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildingPadDesign" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "buildingName" TEXT NOT NULL,
    "topOfSlab" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ffElevation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "padSubgrade" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overExcavation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "compactedLift" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentShrinkage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentSwell" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgCutDepth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgFillDepth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sqft" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cutVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fillVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildingPadDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PavingDesign" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "pavingArea" TEXT NOT NULL DEFAULT '',
    "subgradeDepth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "baseThickness" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pavementType" TEXT NOT NULL DEFAULT '',
    "sqft" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cutVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fillVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PavingDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PondDesign" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "pondName" TEXT NOT NULL,
    "topElevation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bottomElevation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sideSlope" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "length" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cutVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PondDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaEntry" (
    "id" TEXT NOT NULL,
    "designType" "DesignType" NOT NULL,
    "stationOrGrid" TEXT NOT NULL,
    "existingElevation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proposedElevation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cutOrFill" "CutOrFill" NOT NULL,
    "area" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL,
    "buildingPadDesignId" TEXT,
    "pavingDesignId" TEXT,
    "pondDesignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AreaEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostWriteUpItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" "CostCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "totalFromBid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adjustedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostWriteUpItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarkupConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "overhead" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "profit" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "bond" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mobilization" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insuranceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkupConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarkupLineItem" (
    "id" TEXT NOT NULL,
    "markupConfigId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "markupPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalWithMarkup" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkupLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculatorSnapshot" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "calculatorType" "CalculatorType" NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "inputs" JSONB NOT NULL,
    "outputs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalculatorSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlternateSection" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "addDeduct" "AddDeduct" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlternateSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "fileUrl" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultLineItems" JSONB,
    "defaultMarkup" JSONB,
    "defaultCalculatorInputs" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefaultTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "JobInfo_projectId_key" ON "JobInfo"("projectId");

-- CreateIndex
CREATE INDEX "BidSection_projectId_idx" ON "BidSection"("projectId");

-- CreateIndex
CREATE INDEX "LineItem_bidSectionId_idx" ON "LineItem"("bidSectionId");

-- CreateIndex
CREATE INDEX "BuildingPadDesign_projectId_idx" ON "BuildingPadDesign"("projectId");

-- CreateIndex
CREATE INDEX "PavingDesign_projectId_idx" ON "PavingDesign"("projectId");

-- CreateIndex
CREATE INDEX "PondDesign_projectId_idx" ON "PondDesign"("projectId");

-- CreateIndex
CREATE INDEX "AreaEntry_buildingPadDesignId_idx" ON "AreaEntry"("buildingPadDesignId");

-- CreateIndex
CREATE INDEX "AreaEntry_pavingDesignId_idx" ON "AreaEntry"("pavingDesignId");

-- CreateIndex
CREATE INDEX "AreaEntry_pondDesignId_idx" ON "AreaEntry"("pondDesignId");

-- CreateIndex
CREATE INDEX "CostWriteUpItem_projectId_idx" ON "CostWriteUpItem"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "MarkupConfig_projectId_key" ON "MarkupConfig"("projectId");

-- CreateIndex
CREATE INDEX "MarkupLineItem_markupConfigId_idx" ON "MarkupLineItem"("markupConfigId");

-- CreateIndex
CREATE INDEX "CalculatorSnapshot_projectId_idx" ON "CalculatorSnapshot"("projectId");

-- CreateIndex
CREATE INDEX "AlternateSection_projectId_idx" ON "AlternateSection"("projectId");

-- CreateIndex
CREATE INDEX "Report_projectId_idx" ON "Report"("projectId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobInfo" ADD CONSTRAINT "JobInfo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidSection" ADD CONSTRAINT "BidSection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_bidSectionId_fkey" FOREIGN KEY ("bidSectionId") REFERENCES "BidSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildingPadDesign" ADD CONSTRAINT "BuildingPadDesign_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PavingDesign" ADD CONSTRAINT "PavingDesign_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PondDesign" ADD CONSTRAINT "PondDesign_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaEntry" ADD CONSTRAINT "AreaEntry_buildingPadDesignId_fkey" FOREIGN KEY ("buildingPadDesignId") REFERENCES "BuildingPadDesign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaEntry" ADD CONSTRAINT "AreaEntry_pavingDesignId_fkey" FOREIGN KEY ("pavingDesignId") REFERENCES "PavingDesign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaEntry" ADD CONSTRAINT "AreaEntry_pondDesignId_fkey" FOREIGN KEY ("pondDesignId") REFERENCES "PondDesign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostWriteUpItem" ADD CONSTRAINT "CostWriteUpItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkupConfig" ADD CONSTRAINT "MarkupConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkupLineItem" ADD CONSTRAINT "MarkupLineItem_markupConfigId_fkey" FOREIGN KEY ("markupConfigId") REFERENCES "MarkupConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculatorSnapshot" ADD CONSTRAINT "CalculatorSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlternateSection" ADD CONSTRAINT "AlternateSection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultTemplate" ADD CONSTRAINT "DefaultTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
