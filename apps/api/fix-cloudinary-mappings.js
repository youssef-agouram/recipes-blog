const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: "postgresql://postgres:postgres@localhost:5432/recipes_db" }
  }
});

async function main() {
  console.log("Updating database recipe images with valid Cloudinary assets...");

  const mappings = {
    // Recipes
    17: { // Indomi
      imageUrl: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805774/indomie-noodles_rks5ql.webp",
      images: []
    },
    16: { // Salad
      imageUrl: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805780/salad1_ifteag.webp",
      images: [
        "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805780/salad2_thq1rb.webp",
        "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805781/salad3_yv3d8t.webp",
        "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805782/salad4_vif2xo.webp"
      ]
    },
    18: { // Cake chocolat
      imageUrl: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805785/white_cake1_d590cd.jpg",
      images: []
    },
    37: { // Milkcake
      imageUrl: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805785/white_cake2_mqlhfo.webp",
      images: []
    },
    28: { // Milk Cake Chocoolat
      imageUrl: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805785/white_cake_3_zqrfgh.webp",
      images: []
    },
    25: { // Chokolt
      imageUrl: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805786/white_cake4_ueuw5s.webp",
      images: []
    },
    19: { // Sweet
      imageUrl: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805782/sweets_zehyx0.webp",
      images: []
    },
    20: { // Creamy Garlic Parmesan Pasta
      imageUrl: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805775/maxresdefault_ogjsty.webp",
      images: []
    },
    38: { // Deliciously Dorky
      imageUrl: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805779/pinkik1_zl79oj.jpg",
      images: []
    },
    45: { // test
      imageUrl: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805778/pankik6_e6reg5.webp",
      images: []
    },
    46: { // title
      imageUrl: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805778/pankik7_rlebbp.webp",
      images: []
    }
  };

  for (const [id, data] of Object.entries(mappings)) {
    try {
      await prisma.recipe.update({
        where: { id: Number(id) },
        data: {
          imageUrl: data.imageUrl,
          images: data.images
        }
      });
      console.log(`Updated Recipe ID ${id}`);
    } catch (e) {
      console.log(`Failed to update Recipe ID ${id}: ${e.message}`);
    }
  }

  // Categories
  const catMappings = {
    5: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805779/pinkik1_ssqjrl.webp", // Smoothies
    10: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805778/pankik4_pt6ruf.jpg", // fish
    1: "https://res.cloudinary.com/dpwkmt5kr/image/upload/v1779805776/pankik3_dqasol.webp" // Breakfast
  };

  for (const [id, url] of Object.entries(catMappings)) {
    try {
      await prisma.category.update({
        where: { id: Number(id) },
        data: { imageUrl: url }
      });
      console.log(`Updated Category ID ${id}`);
    } catch (e) {
      console.log(`Failed to update Category ID ${id}: ${e.message}`);
    }
  }

  console.log("Migration complete!");
}

main().finally(() => prisma.$disconnect());
