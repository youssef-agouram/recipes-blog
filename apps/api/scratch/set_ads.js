const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    console.log('No settings found');
    return;
  }

  const updated = await prisma.siteSettings.update({
    where: { id: settings.id },
    data: {
      commentSettings: {
        ads: {
          topBarAdUrl: 'https://www.youtube.com/watch?v=9wt6NjN4oA8',
          bottomBarVideoUrl: 'https://www.youtube.com/watch?v=9wt6NjN4oA8',
          popupAdImageUrl: 'https://www.youtube.com/watch?v=9wt6NjN4oA8',
          showPopupAd: true
        }
      }
    }
  });

  console.log('Updated Settings:', updated);
}

main().catch(console.error);
