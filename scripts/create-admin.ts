import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      permissions: JSON.stringify([
        "CAN_VIEW_DASHBOARD",
        "CAN_EDIT_GANTT",
        "CAN_MANAGE_PROJECTS",
        "CAN_MANAGE_TEAM",
        "CAN_MANAGE_USERS",
        "CAN_MANAGE_ROLES",
        "CAN_MANAGE_TECHNOLOGIES",
        "CAN_VIEW_REQUESTS",
      ]),
    },
  });

  const hash = bcryptjs.hashSync("admin", 10);
  await prisma.member.upsert({
    where: { email: "admin@admin.com" },
    update: { passwordHash: hash, roleId: adminRole.id },
    create: {
      nom: "Admin",
      prenom: "Super",
      role: "Administrateur",
      email: "admin@admin.com",
      passwordHash: hash,
      isActive: true,
      dateArrivee: new Date(),
      roleId: adminRole.id,
    },
  });

  console.log("✅ Compte admin créé : admin@admin.com / admin");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
