const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const recipes = await prisma.recipe.findMany({ where: { title: 'Deliciously Dorky' }});
  console.log(recipes.map(r => ({ id: r.id, title: r.title, totalTime: r.totalTime, prepTime: r.prepTime })));
}
main().finally(() => prisma.$disconnect());
