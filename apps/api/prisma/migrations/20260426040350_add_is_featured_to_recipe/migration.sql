-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Recipe_isFeatured_idx" ON "Recipe"("isFeatured");
