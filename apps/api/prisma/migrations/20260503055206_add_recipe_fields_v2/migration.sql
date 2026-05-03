-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "allowComments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cookTime" TEXT,
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "ingredientsJson" JSONB DEFAULT '[]',
ADD COLUMN     "prepTime" TEXT,
ADD COLUMN     "servings" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PUBLISHED';

-- CreateIndex
CREATE INDEX "Recipe_status_idx" ON "Recipe"("status");
