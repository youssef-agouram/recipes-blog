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
          showTopBarAd: true,
          topBarAdUrl: 'https://www.youtube.com/watch?v=9wt6NjN4oA8',
          showBottomBarAd: true,
          bottomBarVideoUrl: 'https://www.youtube.com/watch?v=9wt6NjN4oA8',
          showPopupAd: true,
          popupAdImageUrl: 'https://www.youtube.com/watch?v=9wt6NjN4oA8'
        }
      }
    }
  });

  console.log('Updated Settings:', updated);
}

main().catch(console.error);
