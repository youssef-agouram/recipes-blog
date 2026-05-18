const { PrismaClient } = require('@prisma/client');

async function checkWithUrl(url, db) {
  console.log(`Checking database: ${db} using URL: ${url}`);
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });

  try {
    await prisma.$connect();
    
    // Check Article count
    const articleCount = await prisma.article.count().catch(() => -1);
    const recipeCount = await prisma.recipe.count().catch(() => -1);
    
    console.log(`Connection successful for ${db}! Articles: ${articleCount}, Recipes: ${recipeCount}`);
    
    if (articleCount > 0 || recipeCount > 0) {
      console.log(`\n🎉 FOUND DATA IN ${db}!`);
      if (articleCount > 0) {
        const articles = await prisma.article.findMany();
        console.log(`--- ARTICLES (${articleCount}) ---`);
        console.log(JSON.stringify(articles, null, 2));
      }
      if (recipeCount > 0) {
        const recipes = await prisma.recipe.findMany();
        console.log(`--- RECIPES (${recipeCount}) ---`);
        console.log(JSON.stringify(recipes, null, 2));
      }
      await prisma.$disconnect();
      return true;
    }
    
    await prisma.$disconnect();
    return false;
  } catch (err) {
    // console.error(`Failed to connect to ${db}: ${err.message}`);
    await prisma.$disconnect();
    return false;
  }
}

async function main() {
  const passwords = ['postgres', 'Ayou123beMr', ''];
  const dbNames = ['recipes_db', 'postgres'];
  
  for (const db of dbNames) {
    for (const pw of passwords) {
      const url = `postgresql://postgres:${pw}@localhost:5432/${db}`;
      const success = await checkWithUrl(url, db);
      if (success) {
        return;
      }
    }
  }
  console.log("Finished check.");
}

main();
