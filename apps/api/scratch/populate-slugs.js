const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    where: { slug: null }
  });

  for (const cat of categories) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await prisma.category.update({
      where: { id: cat.id },
      data: { slug }
    });
    console.log(`Updated category ${cat.name} with slug ${slug}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
