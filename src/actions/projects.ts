"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const projectSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  client: z.string().min(1, "Le client est requis"),
  status: z.enum(["ACTIVE", "PAUSED", "DONE"]),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export async function getProjects() {
  return prisma.project.findMany({
    orderBy: { nom: "asc" },
    include: { _count: { select: { tasks: true, sprints: true } } },
  });
}

export async function getProjectsWithDates() {
  const projects = await prisma.project.findMany({
    orderBy: { nom: "asc" },
    include: {
      sprints: {
        orderBy: { dateDebut: "asc" },
        select: { dateDebut: true, dateFin: true },
      },
      tasks: {
        orderBy: { dateDebut: "asc" },
        select: { dateDebut: true, dateFin: true },
      },
      _count: { select: { tasks: true, sprints: true } },
    },
  });

  return projects.map((p) => {
    const allDates = [
      ...p.sprints.map((s) => ({ start: s.dateDebut, end: s.dateFin })),
      ...p.tasks.map((t) => ({ start: t.dateDebut, end: t.dateFin })),
    ];

    let effectiveStart = p.startDate;
    let effectiveEnd = p.endDate;

    if (!effectiveStart && allDates.length > 0) {
      effectiveStart = allDates.reduce(
        (min, d) => (d.start < min ? d.start : min),
        allDates[0].start
      );
    }
    if (!effectiveEnd && allDates.length > 0) {
      effectiveEnd = allDates.reduce(
        (max, d) => (d.end > max ? d.end : max),
        allDates[0].end
      );
    }

    return {
      id: p.id,
      nom: p.nom,
      client: p.client,
      status: p.status,
      startDate: effectiveStart,
      endDate: effectiveEnd,
      _count: p._count,
    };
  });
}

export async function createProject(data: z.infer<typeof projectSchema>) {
  const parsed = projectSchema.parse(data);
  await prisma.project.create({
    data: {
      nom: parsed.nom,
      client: parsed.client,
      status: parsed.status,
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
    },
  });
  revalidatePath("/admin/projects");
}

export async function updateProject(
  id: string,
  data: z.infer<typeof projectSchema>
) {
  const parsed = projectSchema.parse(data);
  await prisma.project.update({
    where: { id },
    data: {
      nom: parsed.nom,
      client: parsed.client,
      status: parsed.status,
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
    },
  });
  revalidatePath("/admin/projects");
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/projects");
}
