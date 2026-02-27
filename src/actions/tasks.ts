"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const taskSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  type: z.enum(["SPRINT", "TASK"]).default("TASK"),
  dateDebut: z.string().min(1, "La date de debut est requise"),
  dateFin: z.string().min(1, "La date de fin est requise"),
  load: z.number().min(0).max(1),
  projectId: z.string().min(1, "Le projet est requis"),
  sprintId: z.string().optional().nullable(),
  memberIds: z.array(z.string()).default([]),
  technologyId: z.string().optional().nullable(),
});

export async function getTasks() {
  return prisma.task.findMany({
    orderBy: { dateDebut: "asc" },
    include: {
      project: true,
      sprint: true,
      members: true,
      technology: true,
    },
  });
}

export async function getTasksFiltered(filters: {
  memberId?: string;
  projectId?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters.memberId) {
    where.members = { some: { id: filters.memberId } };
  }
  if (filters.projectId) where.projectId = filters.projectId;

  return prisma.task.findMany({
    where,
    orderBy: { dateDebut: "asc" },
    include: {
      project: true,
      sprint: true,
      members: true,
      technology: true,
    },
  });
}

export async function createTask(data: z.infer<typeof taskSchema>) {
  const parsed = taskSchema.parse(data);
  await prisma.task.create({
    data: {
      titre: parsed.titre,
      type: parsed.type,
      dateDebut: new Date(parsed.dateDebut),
      dateFin: new Date(parsed.dateFin),
      load: parsed.load,
      projectId: parsed.projectId,
      sprintId: parsed.sprintId || null,
      members: {
        connect: parsed.memberIds.map((id) => ({ id })),
      },
      technologyId: parsed.technologyId || null,
    },
  });
  revalidatePath("/dashboard");
}

export async function updateTask(
  id: string,
  data: z.infer<typeof taskSchema>
) {
  const parsed = taskSchema.parse(data);
  await prisma.task.update({
    where: { id },
    data: {
      titre: parsed.titre,
      type: parsed.type,
      dateDebut: new Date(parsed.dateDebut),
      dateFin: new Date(parsed.dateFin),
      load: parsed.load,
      projectId: parsed.projectId,
      sprintId: parsed.sprintId || null,
      members: {
        set: parsed.memberIds.map((id) => ({ id })),
      },
      technologyId: parsed.technologyId || null,
    },
  });
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/dashboard");
}
