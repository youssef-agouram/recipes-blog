const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const recipes = await prisma.recipe.findMany({
    include: { categories: true, ingredients: true, seo: true }
  });
  console.log(`Fetched ${recipes.length} recipes successfully.`);
}
main().finally(() => prisma.$disconnect());
