const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: "postgresql://postgres:postgres@localhost:5432/recipes_db" }
  }
});

async function main() {
  const recipes = await prisma.recipe.findMany();
  console.log("--- RECIPES ---");
  recipes.forEach(r => {
    console.log(`- ID: ${r.id}, Title: "${r.title}", Image: "${r.imageUrl}", Images: ${JSON.stringify(r.images)}`);
  });

  const categories = await prisma.category.findMany();
  console.log("\n--- CATEGORIES ---");
  categories.forEach(c => {
    console.log(`- ID: ${c.id}, Name: "${c.name}", Image: "${c.imageUrl}"`);
  });
}

main().finally(() => prisma.$disconnect());
