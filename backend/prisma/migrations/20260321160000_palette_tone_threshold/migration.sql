-- AlterTable
ALTER TABLE "PaletteExtraction"
ADD COLUMN "classificationThreshold" INTEGER NOT NULL DEFAULT 155;

-- AlterTable
ALTER TABLE "PaletteColor"
ADD COLUMN "luminance" DOUBLE PRECISION,
ADD COLUMN "toneCategory" TEXT;
