const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const recipes = await prisma.recipe.findMany({
    select: { status: true }
  });
  console.log('Recipe Statuses:', recipes.map(r => r.status));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
