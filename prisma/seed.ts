import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Create roles
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

  await prisma.role.upsert({
    where: { name: "Manager" },
    update: {},
    create: {
      name: "Manager",
      permissions: JSON.stringify([
        "CAN_VIEW_DASHBOARD",
        "CAN_EDIT_GANTT",
        "CAN_MANAGE_PROJECTS",
        "CAN_MANAGE_TEAM",
        "CAN_VIEW_REQUESTS",
      ]),
    },
  });

  await prisma.role.upsert({
    where: { name: "Dev" },
    update: {},
    create: {
      name: "Dev",
      permissions: JSON.stringify(["CAN_VIEW_DASHBOARD"]),
    },
  });

  // 2. Create technologies
  const techReact = await prisma.technology.upsert({
    where: { nom: "React" },
    update: {},
    create: { nom: "React", couleur: "#61DAFB", iconName: "atom" },
  });

  const techNode = await prisma.technology.upsert({
    where: { nom: "Node.js" },
    update: {},
    create: { nom: "Node.js", couleur: "#339933", iconName: "server" },
  });

  const techPython = await prisma.technology.upsert({
    where: { nom: "Python" },
    update: {},
    create: { nom: "Python", couleur: "#3776AB", iconName: "code" },
  });

  const techTypeScript = await prisma.technology.upsert({
    where: { nom: "TypeScript" },
    update: {},
    create: { nom: "TypeScript", couleur: "#3178C6", iconName: "file-code" },
  });

  // 3. Create admin member with auth
  const hash = bcryptjs.hashSync("admin", 10);
  await prisma.member.upsert({
    where: { email: "admin@admin.com" },
    update: { passwordHash: hash, roleId: adminRole.id, isResource: false },
    create: {
      nom: "Admin",
      prenom: "Super",
      role: "Administrateur",
      email: "admin@admin.com",
      passwordHash: hash,
      isActive: true,
      isResource: false,
      dateArrivee: new Date(),
      roleId: adminRole.id,
    },
  });

  // 4. Create team members
  const member1 = await prisma.member.create({
    data: {
      nom: "Dupont",
      prenom: "Jean",
      role: "Developpeur Frontend",
      dateArrivee: new Date("2024-01-15"),
    },
  });

  const member2 = await prisma.member.create({
    data: {
      nom: "Martin",
      prenom: "Sophie",
      role: "Developpeur Backend",
      dateArrivee: new Date("2024-03-01"),
    },
  });

  const member3 = await prisma.member.create({
    data: {
      nom: "Bernard",
      prenom: "Lucas",
      role: "Developpeur Fullstack",
      dateArrivee: new Date("2024-06-01"),
    },
  });

  // 5. Create projects
  const project1 = await prisma.project.create({
    data: { nom: "Portail Client", client: "Enedis", status: "ACTIVE" },
  });

  const project2 = await prisma.project.create({
    data: { nom: "API Donnees", client: "Enedis", status: "ACTIVE" },
  });

  // 6. Create sprints (Project > Sprint hierarchy)
  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  const sprint1 = await prisma.sprint.create({
    data: {
      titre: "Sprint 1 - Portail",
      description:
        "Premier sprint du portail client. Mise en place de l'architecture et des composants de base.",
      dateDebut: new Date(now.getTime() - 2 * weekMs),
      dateFin: new Date(now.getTime() + 1 * weekMs),
      projectId: project1.id,
    },
  });

  const sprint2 = await prisma.sprint.create({
    data: {
      titre: "Sprint 2 - Portail",
      description:
        "Second sprint : fonctionnalites avancees et integration API.",
      dateDebut: new Date(now.getTime() + 1 * weekMs),
      dateFin: new Date(now.getTime() + 3 * weekMs),
      projectId: project1.id,
    },
  });

  // 7. Create tasks (Sprint > Task hierarchy)
  await prisma.task.create({
    data: {
      titre: "Setup composants UI",
      type: "TASK",
      dateDebut: new Date(now.getTime() - 2 * weekMs),
      dateFin: new Date(now.getTime() - 1 * weekMs),
      load: 0.8,
      isCompleted: true,
      projectId: project1.id,
      sprintId: sprint1.id,
      technologyId: techReact.id,
      members: { connect: [{ id: member1.id }] },
    },
  });

  await prisma.task.create({
    data: {
      titre: "Integration maquettes",
      type: "TASK",
      dateDebut: new Date(now.getTime() - 1 * weekMs),
      dateFin: new Date(now.getTime() + 1 * weekMs),
      load: 1.0,
      projectId: project1.id,
      sprintId: sprint1.id,
      technologyId: techReact.id,
      members: { connect: [{ id: member1.id }, { id: member3.id }] },
    },
  });

  await prisma.task.create({
    data: {
      titre: "Developpement API REST",
      type: "TASK",
      dateDebut: new Date(now.getTime() - 1 * weekMs),
      dateFin: new Date(now.getTime() + 2 * weekMs),
      load: 0.8,
      projectId: project2.id,
      technologyId: techNode.id,
      members: { connect: [{ id: member2.id }] },
    },
  });

  await prisma.task.create({
    data: {
      titre: "Refactoring composants UI",
      type: "TASK",
      dateDebut: new Date(now.getTime() + 1 * weekMs),
      dateFin: new Date(now.getTime() + 2 * weekMs),
      load: 0.6,
      projectId: project1.id,
      sprintId: sprint2.id,
      technologyId: techTypeScript.id,
      members: {
        connect: [{ id: member1.id }, { id: member2.id }, { id: member3.id }],
      },
    },
  });

  await prisma.task.create({
    data: {
      titre: "Scripts migration donnees",
      type: "TASK",
      dateDebut: new Date(now.getTime()),
      dateFin: new Date(now.getTime() + 2 * weekMs),
      load: 0.5,
      projectId: project2.id,
      technologyId: techPython.id,
      members: { connect: [{ id: member3.id }] },
    },
  });

  await prisma.task.create({
    data: {
      titre: "Tests integration",
      type: "TASK",
      dateDebut: new Date(now.getTime() + 3 * weekMs),
      dateFin: new Date(now.getTime() + 4 * weekMs),
      load: 0.5,
      projectId: project1.id,
      sprintId: sprint2.id,
      technologyId: techTypeScript.id,
      members: { connect: [{ id: member2.id }, { id: member3.id }] },
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
