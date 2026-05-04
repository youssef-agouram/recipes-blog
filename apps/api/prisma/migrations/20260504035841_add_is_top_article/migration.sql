-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "isTopArticle" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Recipe_isTopArticle_idx" ON "Recipe"("isTopArticle");
