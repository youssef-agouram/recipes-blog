import prisma from './lib/prisma';

async function main() {
  const users = await prisma.user.findMany();
  console.log('USERS IN DB:', users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
