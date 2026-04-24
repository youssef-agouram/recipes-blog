const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
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
      create: { name },
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
