import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    {
      id: 'dd723b3d-e192-4d05-b1b5-4759a1977957',
      name: 'admin',
      description: 'Administrator with full permissions',
    },
    {
      id: 'fc959621-5ea9-4e7a-85e0-25883ce9bd9b',
      name: 'user',
      description: 'Regular user with limited access',
    },
    {
      id: '3e49c3b4-ec79-4a53-b286-68424837d4e8',
      name: 'super_user',
      description: 'Elevated user with advanced permissions',
    },
    {
      id: 'cc060930-7300-4e54-8844-3166e5aee6d5',
      name: 'superadmin',
      description: 'Root-level access to all system features',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: {
        id: role.id,
        name: role.name,
        description: role.description,
        isActive: true,
      },
    });
  }
}

main()
  .then(() => {
    console.log('✅ Roles seeded with fixed UUIDs.');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
