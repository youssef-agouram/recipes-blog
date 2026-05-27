const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: "postgresql://postgres:postgres@localhost:5432/recipes_db" }
  }
});

async function main() {
  const articles = await prisma.article.findMany();
  console.log(JSON.stringify(articles.map(a => ({
    id: a.id,
    title: a.title,
    imageUrl: a.imageUrl
  })), null, 2));
}

main().finally(() => prisma.$disconnect());
