"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const sprintSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  description: z.string().optional().nullable(),
  dateDebut: z.string().min(1, "La date de debut est requise"),
  dateFin: z.string().min(1, "La date de fin est requise"),
  projectId: z.string().min(1, "Le projet est requis"),
});

export async function getSprints() {
  return prisma.sprint.findMany({
    orderBy: { dateDebut: "asc" },
    include: {
      project: true,
      _count: { select: { tasks: true } },
    },
  });
}

export async function getSprintWithTasks(id: string) {
  return prisma.sprint.findUnique({
    where: { id },
    include: {
      project: true,
      tasks: {
        orderBy: { dateDebut: "asc" },
        include: { members: true, technology: true },
      },
    },
  });
}

export async function createSprint(data: z.infer<typeof sprintSchema>) {
  const parsed = sprintSchema.parse(data);
  await prisma.sprint.create({
    data: {
      titre: parsed.titre,
      description: parsed.description || null,
      dateDebut: new Date(parsed.dateDebut),
      dateFin: new Date(parsed.dateFin),
      projectId: parsed.projectId,
    },
  });
  revalidatePath("/dashboard");
}

export async function updateSprint(
  id: string,
  data: Partial<z.infer<typeof sprintSchema>>
) {
  const updateData: Record<string, unknown> = {};
  if (data.titre !== undefined) updateData.titre = data.titre;
  if (data.description !== undefined)
    updateData.description = data.description || null;
  if (data.dateDebut !== undefined)
    updateData.dateDebut = new Date(data.dateDebut);
  if (data.dateFin !== undefined) updateData.dateFin = new Date(data.dateFin);
  if (data.projectId !== undefined) updateData.projectId = data.projectId;

  await prisma.sprint.update({ where: { id }, data: updateData });
  revalidatePath("/dashboard");
}

export async function deleteSprint(id: string) {
  await prisma.task.deleteMany({ where: { sprintId: id } });
  await prisma.sprint.delete({ where: { id } });
  revalidatePath("/dashboard");
}

/** Create a task directly inside a sprint */
export async function createSprintTask(data: {
  titre: string;
  sprintId: string;
  projectId: string;
}) {
  const sprint = await prisma.sprint.findUniqueOrThrow({
    where: { id: data.sprintId },
  });

  await prisma.task.create({
    data: {
      titre: data.titre,
      type: "TASK",
      dateDebut: sprint.dateDebut,
      dateFin: sprint.dateFin,
      load: 1.0,
      projectId: data.projectId,
      sprintId: data.sprintId,
    },
  });
  revalidatePath("/dashboard");
}

/** Toggle task completion */
export async function toggleTaskCompleted(id: string, isCompleted: boolean) {
  await prisma.task.update({
    where: { id },
    data: { isCompleted },
  });
  revalidatePath("/dashboard");
}

/** Delete a task inside a sprint */
export async function deleteSprintTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/dashboard");
}
