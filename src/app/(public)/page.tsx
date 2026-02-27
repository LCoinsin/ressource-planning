export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { PublicClient } from "./client";

export default async function PublicPage() {
  const [tasks, members] = await Promise.all([
    prisma.task.findMany({
      where: { project: { status: "ACTIVE" } },
      include: {
        technology: true,
        members: { select: { id: true, nom: true, prenom: true, dateArrivee: true, dateDepart: true } },
        project: { select: { id: true, nom: true, client: true, status: true } },
      },
      orderBy: { dateDebut: "asc" },
    }),
    prisma.member.findMany({
      where: { isActive: true, isResource: true, dateDepart: null },
      include: {
        tasks: {
          where: {
            dateFin: { gte: new Date() },
          },
          select: { dateDebut: true, dateFin: true, load: true },
        },
      },
    }),
  ]);

  const serializedTasks = tasks.map((t) => ({
    ...t,
    dateDebut: t.dateDebut.toISOString(),
    dateFin: t.dateFin.toISOString(),
    createdAt: t.createdAt.toISOString(),
    sprintId: t.sprintId ?? null,
    technology: t.technology
      ? { ...t.technology, createdAt: t.technology.createdAt.toISOString() }
      : null,
    members: t.members.map((m) => ({
      ...m,
      dateArrivee: m.dateArrivee.toISOString(),
      dateDepart: m.dateDepart?.toISOString() ?? null,
    })),
    project: t.project,
  }));

  const serializedMembers = members.map((m) => ({
    id: m.id,
    nom: m.nom,
    prenom: m.prenom,
    dateArrivee: m.dateArrivee.toISOString(),
    dateDepart: m.dateDepart?.toISOString() ?? null,
    upcomingLoad: m.tasks.reduce((sum, t) => sum + t.load, 0),
    taskCount: m.tasks.length,
  }));

  return <PublicClient tasks={serializedTasks} members={serializedMembers} />;
}
