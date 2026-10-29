-- CreateTable
CREATE TABLE "Spec" (
    "id" TEXT NOT NULL,
    "style" TEXT,
    "customer" TEXT,
    "season" TEXT,
    "colorway" TEXT,
    "po" TEXT,
    "nameTeam" TEXT,
    "program" TEXT,
    "specDate" TEXT,
    "payloadJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "type" TEXT,
    "name" TEXT,
    "placementDetails" TEXT,
    "specialInstructions" TEXT,
    "dimensions" TEXT,
    "baseSize" TEXT,
    "inkType" TEXT,
    "colorsJson" JSONB,
    "sequenceJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaletteExtraction" (
    "id" TEXT NOT NULL,
    "source" TEXT,
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalColors" INTEGER NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaletteExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaletteColor" (
    "id" TEXT NOT NULL,
    "extractionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "name" TEXT,
    "suggestedName" TEXT,
    "hex" TEXT NOT NULL,
    "rgbJson" JSONB NOT NULL,
    "ocrRawText" TEXT,
    "manuallyCorrected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaletteColor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Placement_specId_idx" ON "Placement"("specId");

-- CreateIndex
CREATE INDEX "PaletteColor_extractionId_idx" ON "PaletteColor"("extractionId");

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_specId_fkey" FOREIGN KEY ("specId") REFERENCES "Spec"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaletteColor" ADD CONSTRAINT "PaletteColor_extractionId_fkey" FOREIGN KEY ("extractionId") REFERENCES "PaletteExtraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
