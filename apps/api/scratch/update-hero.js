const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const imageUrl = "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1920&q=80";
  
  await prisma.heroSettings.upsert({
    where: { id: 1 },
    update: { imageUrl },
    create: {
      id: 1,
      title: "Good Food, Good Mood",
      subtitle: "Explore thousands of handpicked recipes from around the world.",
      ctaText: "Explore Recipes",
      imageUrl
    }
  });
  console.log('Hero Settings updated successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
