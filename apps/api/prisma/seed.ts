const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

async function main() {
  // Default Admin User
  const adminEmail = "admin@recipeblog.com";
  const hashedPassword = await bcrypt.hash("adminpassword123", 10);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin User",
      password: hashedPassword,
    },
  });
  console.log("Admin user created: " + adminEmail);

  // Upsert Categories
  const categories = ["Breakfast", "Dinner", "Vegan", "Dessert", "Smoothies"];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { 
        name,
        slug: name.toLowerCase()
      },
    });
  }

  const breakfast = await prisma.category.findUnique({ where: { name: "Breakfast" } });
  const vegan = await prisma.category.findUnique({ where: { name: "Vegan" } });
  const dinner = await prisma.category.findUnique({ where: { name: "Dinner" } });

  // Sample Recipes
  const recipes = [
    {
      title: "Avocado Toast with Poached Egg",
      slug: "avocado-toast-poached-egg",
      summary: "A simple, clean, and nutritious start to your day.",
      content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Start with a thick slice of sourdough bread..." }] }] },
      categories: [breakfast?.id, vegan?.id].filter(Boolean),
    },
    {
      title: "Mediterranean Quinoa Bowl",
      slug: "mediterranean-quinoa-bowl",
      summary: "Fresh vegetables and protein-packed quinoa with a lemon tahini dressing.",
      content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Cook the quinoa according to package instructions..." }] }] },
      categories: [vegan?.id, dinner?.id].filter(Boolean),
    },
    {
      title: "Roasted Tomato Basil Soup",
      slug: "roasted-tomato-basil-soup",
      summary: "Comforting and rich, perfect for chilly evenings.",
      content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Roast the tomatoes with garlic and olive oil..." }] }] },
      categories: [dinner?.id].filter(Boolean),
    },
  ];

  for (const r of recipes) {
    await prisma.recipe.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
        title: r.title,
        slug: r.slug,
        summary: r.summary,
        content: r.content,
        categories: {
          connect: r.categories.map(id => ({ id }))
        }
      },
    });
  }

  // Seed Easy Chicken Tagine Recipe from JSON if present
  const taginePath = path.join(__dirname, 'easy-chicken-tagine.json');
  if (fs.existsSync(taginePath)) {
    let tagineRaw = fs.readFileSync(taginePath, 'utf8');
    if (tagineRaw.charCodeAt(0) === 0xFEFF) {
      tagineRaw = tagineRaw.slice(1);
    }
    const tagine = JSON.parse(tagineRaw);
    
    // Find category IDs for the tagine recipe
    const tagineCategories = [];
    if (tagine.categoryNames && Array.isArray(tagine.categoryNames)) {
      for (const catName of tagine.categoryNames) {
        const cat = await prisma.category.findUnique({ where: { name: catName } });
        if (cat) {
          tagineCategories.push({ id: cat.id });
        }
      }
    }

    await prisma.recipe.upsert({
      where: { slug: tagine.slug },
      update: {},
      create: {
        title: tagine.title,
        slug: tagine.slug,
        summary: tagine.summary,
        content: tagine.content,
        imageUrl: tagine.imageUrl,
        images: tagine.images,
        isFeatured: tagine.isFeatured,
        isTopArticle: tagine.isTopArticle,
        status: tagine.status,
        prepTime: tagine.prepTime,
        cookTime: tagine.cookTime,
        totalTime: tagine.totalTime,
        servings: tagine.servings,
        difficulty: tagine.difficulty,
        videoUrl: tagine.videoUrl,
        nutrition: tagine.nutrition,
        views: tagine.views,
        allowComments: tagine.allowComments,
        ingredientsJson: tagine.ingredientsJson,
        instructions: tagine.instructions,
        categories: {
          connect: tagineCategories
        }
      }
    });
    console.log("Chicken Tagine recipe seeded successfully!");
  }

  // Sample Articles Seeding
  const articles = [
    {
      title: "The Art of Slow Cooking: A Beginner's Guide",
      slug: "art-of-slow-cooking-beginners-guide",
      summary: "Discover the secrets to tender, flavorful meals with our comprehensive guide to slow cooking techniques, equipment, and recipes.",
      content: "Slow cooking is one of the most rewarding culinary techniques. By cooking ingredients at a low temperature for an extended period, you allow tough fibers to break down and flavors to meld together beautifully. In this guide, we will explore the essential equipment, key temperature settings, and best practices for creating mouthwatering slow-cooked stews, braises, and roasts. Whether you are using a traditional Dutch oven or a modern electric slow cooker, these tips will elevate your home cooking to the next level.",
      category: "Cooking Guide",
      isTopArticle: true,
      imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "5 Essential Kitchen Tools Every Home Chef Needs",
      slug: "5-essential-kitchen-tools",
      summary: "Equip your kitchen for success with these five must-have culinary tools recommended by professional chefs.",
      content: "A craftsman is only as good as their tools, and the same applies to the home kitchen. While the culinary market is filled with flashy gadgets, a few high-quality basics are all you really need to cook like a pro. In this article, we break down the five most essential tools: a sharp chef's knife, a heavy-duty cutting board, a cast-iron skillet, a digital kitchen scale, and a high-quality thermometer. Invest in these kitchen workhorses, and you'll find preparation faster, cleaner, and much more enjoyable.",
      category: "Kitchen Tips",
      isTopArticle: false,
      imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "The Science of Baking: Why Ratios Matter",
      slug: "science-of-baking-ratios-matter",
      summary: "Understand the chemistry behind your favorite baked goods to achieve perfect texture and rise every single time.",
      content: "Unlike savory cooking, where a pinch of this and a dash of that can lead to a delicious surprise, baking is an exact science. Every ingredient plays a precise chemical role. Flour provides structure, sugar tenderizes and browns, fats inhibit gluten development, and leaveners create rise. In this deep dive, we explore how minor adjustments to ingredient ratios can transform a cake from fluffy and moist to dense and crumbly. Master these ratios, and you will unlock the confidence to create your own baking recipes from scratch.",
      category: "Baking",
      isTopArticle: false,
      imageUrl: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Mastering the Knife: Essential Cuts and Techniques",
      slug: "mastering-the-knife-essential-cuts",
      summary: "Improve your prep speed and cooking consistency by learning professional knife handling and fundamental cutting techniques.",
      content: "Proper knife skills are the foundation of all great cooking. Not only do uniform cuts ensure that your ingredients cook at the same rate, but they also elevate the visual appeal of your dishes. In this article, we demonstrate how to hold a chef's knife safely, position your guiding hand in the 'claw grip', and execute fundamental cuts such as dice, julienne, chiffonade, and batonet. With a little practice, you'll slash your prep time in half and cook with the confidence of a professional chef.",
      category: "Cooking Guide",
      isTopArticle: false,
      imageUrl: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=800&q=80"
    }
  ];

  for (const art of articles) {
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {},
      create: {
        title: art.title,
        slug: art.slug,
        summary: art.summary,
        content: art.content,
        category: art.category,
        isTopArticle: art.isTopArticle,
        imageUrl: art.imageUrl
      }
    });
  }
  console.log("Articles seeded successfully!");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
