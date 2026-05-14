const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const recipes = await prisma.recipe.count();
  const users = await prisma.user.count();
  const comments = await prisma.comment.count();
  const categories = await prisma.category.count();
  const articles = await prisma.article.count();
  
  console.log({
    recipes,
    users,
    comments,
    categories,
    articles
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
