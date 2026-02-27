"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const technologySchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  couleur: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadecimale invalide"),
  iconName: z.string().min(1, "L'icone est requise"),
  customSvg: z.string().nullable().optional(),
});

export async function getTechnologies() {
  return prisma.technology.findMany({ orderBy: { nom: "asc" } });
}

export async function createTechnology(data: z.infer<typeof technologySchema>) {
  const parsed = technologySchema.parse(data);
  await prisma.technology.create({
    data: {
      nom: parsed.nom,
      couleur: parsed.couleur,
      iconName: parsed.iconName,
      customSvg: parsed.customSvg ?? null,
    },
  });
  revalidatePath("/admin/technologies");
}

export async function updateTechnology(
  id: string,
  data: z.infer<typeof technologySchema>
) {
  const parsed = technologySchema.parse(data);
  await prisma.technology.update({
    where: { id },
    data: {
      nom: parsed.nom,
      couleur: parsed.couleur,
      iconName: parsed.iconName,
      customSvg: parsed.customSvg ?? null,
    },
  });
  revalidatePath("/admin/technologies");
}

export async function deleteTechnology(id: string) {
  await prisma.technology.delete({ where: { id } });
  revalidatePath("/admin/technologies");
}
