const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const cloudinaryBaseUrl = 'https://res.cloudinary.com/dpwkmt5kr/image/upload/recipes-plat';

  console.log('Starting Cloudinary image URL migration in database...');

  // 1. Update Recipe imageUrl and images array
  const recipes = await prisma.recipe.findMany();
  let recipeUpdatesCount = 0;
  for (const recipe of recipes) {
    let updated = false;
    let newImageUrl = recipe.imageUrl;
    let newImages = [...recipe.images];

    if (recipe.imageUrl && recipe.imageUrl.startsWith('/uploads/')) {
      const filename = recipe.imageUrl.replace('/uploads/', '');
      newImageUrl = `${cloudinaryBaseUrl}/${filename}`;
      updated = true;
    }

    newImages = newImages.map(img => {
      if (img && img.startsWith('/uploads/')) {
        updated = true;
        const filename = img.replace('/uploads/', '');
        return `${cloudinaryBaseUrl}/${filename}`;
      }
      return img;
    });

    if (updated) {
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          imageUrl: newImageUrl,
          images: newImages,
        }
      });
      recipeUpdatesCount++;
      console.log(`Updated Recipe [${recipe.id}]: ${recipe.title}`);
    }
  }
  console.log(`Recipes updated: ${recipeUpdatesCount}`);

  // 2. Update Category imageUrl
  const categories = await prisma.category.findMany();
  let categoryUpdatesCount = 0;
  for (const category of categories) {
    if (category.imageUrl && category.imageUrl.startsWith('/uploads/')) {
      const filename = category.imageUrl.replace('/uploads/', '');
      const newImageUrl = `${cloudinaryBaseUrl}/${filename}`;
      await prisma.category.update({
        where: { id: category.id },
        data: { imageUrl: newImageUrl }
      });
      categoryUpdatesCount++;
      console.log(`Updated Category [${category.id}]: ${category.name}`);
    }
  }
  console.log(`Categories updated: ${categoryUpdatesCount}`);

  // 3. Update Article imageUrl
  const articles = await prisma.article.findMany();
  let articleUpdatesCount = 0;
  for (const article of articles) {
    if (article.imageUrl && article.imageUrl.startsWith('/uploads/')) {
      const filename = article.imageUrl.replace('/uploads/', '');
      const newImageUrl = `${cloudinaryBaseUrl}/${filename}`;
      await prisma.article.update({
        where: { id: article.id },
        data: { imageUrl: newImageUrl }
      });
      articleUpdatesCount++;
      console.log(`Updated Article [${article.id}]: ${article.title}`);
    }
  }
  console.log(`Articles updated: ${articleUpdatesCount}`);

  // 4. Update User avatar
  const users = await prisma.user.findMany();
  let userUpdatesCount = 0;
  for (const user of users) {
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const filename = user.avatar.replace('/uploads/', '');
      const newAvatar = `${cloudinaryBaseUrl}/${filename}`;
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: newAvatar }
      });
      userUpdatesCount++;
      console.log(`Updated User [${user.id}]: ${user.email}`);
    }
  }
  console.log(`Users updated: ${userUpdatesCount}`);

  // 5. Update Comment avatar
  const comments = await prisma.comment.findMany();
  let commentUpdatesCount = 0;
  for (const comment of comments) {
    if (comment.avatar && comment.avatar.startsWith('/uploads/')) {
      const filename = comment.avatar.replace('/uploads/', '');
      const newAvatar = `${cloudinaryBaseUrl}/${filename}`;
      await prisma.comment.update({
        where: { id: comment.id },
        data: { avatar: newAvatar }
      });
      commentUpdatesCount++;
      console.log(`Updated Comment [${comment.id}]`);
    }
  }
  console.log(`Comments updated: ${commentUpdatesCount}`);

  // 6. Update HeroSettings
  const heroSettings = await prisma.heroSettings.findMany();
  let heroUpdatesCount = 0;
  for (const hero of heroSettings) {
    let updated = false;
    let newImageUrl = hero.imageUrl;
    let newImages = [...hero.images];

    if (hero.imageUrl && hero.imageUrl.startsWith('/uploads/')) {
      const filename = hero.imageUrl.replace('/uploads/', '');
      newImageUrl = `${cloudinaryBaseUrl}/${filename}`;
      updated = true;
    }

    newImages = newImages.map(img => {
      if (img && img.startsWith('/uploads/')) {
        updated = true;
        const filename = img.replace('/uploads/', '');
        return `${cloudinaryBaseUrl}/${filename}`;
      }
      return img;
    });

    if (updated) {
      await prisma.heroSettings.update({
        where: { id: hero.id },
        data: {
          imageUrl: newImageUrl,
          images: newImages,
        }
      });
      heroUpdatesCount++;
      console.log(`Updated HeroSettings [${hero.id}]`);
    }
  }
  console.log(`Hero settings updated: ${heroUpdatesCount}`);

  // 7. Delete local uploaded files to free up space
  console.log('\nCleaning up local uploaded files...');
  const uploadsDir = path.resolve(__dirname, '../web/public/uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    console.log(`Found ${files.length} local files in public/uploads.`);
    let deletedCount = 0;
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete local file ${file}:`, err);
      }
    }
    console.log(`Successfully deleted ${deletedCount} local files from public/uploads.`);
  } else {
    console.log('No local public/uploads directory found.');
  }

  console.log('\nMigration finished successfully!');
}

main()
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
