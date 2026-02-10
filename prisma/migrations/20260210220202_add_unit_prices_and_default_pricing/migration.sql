-- CreateTable
CREATE TABLE "UnitPrice" (
    "id" TEXT NOT NULL,
    "category" "SectionType" NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT '',
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "crewCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "productionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultPricingConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "overhead" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "profit" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "bond" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mobilization" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insuranceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefaultPricingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UnitPrice_category_idx" ON "UnitPrice"("category");
