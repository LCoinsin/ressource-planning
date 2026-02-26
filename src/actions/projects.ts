"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const projectSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  client: z.string().min(1, "Le client est requis"),
  status: z.enum(["ACTIVE", "PAUSED", "DONE"]),
});

export async function getProjects() {
  return prisma.project.findMany({
    orderBy: { nom: "asc" },
    include: { _count: { select: { tasks: true } } },
  });
}

export async function createProject(data: z.infer<typeof projectSchema>) {
  const parsed = projectSchema.parse(data);
  await prisma.project.create({ data: parsed });
  revalidatePath("/admin/projects");
}

export async function updateProject(
  id: string,
  data: z.infer<typeof projectSchema>
) {
  const parsed = projectSchema.parse(data);
  await prisma.project.update({ where: { id }, data: parsed });
  revalidatePath("/admin/projects");
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/projects");
}
