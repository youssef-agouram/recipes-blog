-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Recipe_slug_idx" ON "Recipe"("slug");

-- CreateIndex
CREATE INDEX "Recipe_title_idx" ON "Recipe"("title");
