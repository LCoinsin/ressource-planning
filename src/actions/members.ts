"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const memberSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prenom est requis"),
  role: z.string().min(1, "Le role est requis"),
  dateArrivee: z.string().min(1, "La date d'arrivee est requise"),
  dateDepart: z.string().optional().nullable(),
});

export async function getMembers() {
  return prisma.member.findMany({
    orderBy: { nom: "asc" },
    include: { _count: { select: { tasks: true } } },
  });
}

export async function createMember(data: z.infer<typeof memberSchema>) {
  const parsed = memberSchema.parse(data);
  await prisma.member.create({
    data: {
      nom: parsed.nom,
      prenom: parsed.prenom,
      role: parsed.role,
      dateArrivee: new Date(parsed.dateArrivee),
      dateDepart: parsed.dateDepart ? new Date(parsed.dateDepart) : null,
    },
  });
  revalidatePath("/admin/team");
}

export async function updateMember(
  id: string,
  data: z.infer<typeof memberSchema>
) {
  const parsed = memberSchema.parse(data);
  await prisma.member.update({
    where: { id },
    data: {
      nom: parsed.nom,
      prenom: parsed.prenom,
      role: parsed.role,
      dateArrivee: new Date(parsed.dateArrivee),
      dateDepart: parsed.dateDepart ? new Date(parsed.dateDepart) : null,
    },
  });
  revalidatePath("/admin/team");
}

export async function deleteMember(id: string) {
  await prisma.member.delete({ where: { id } });
  revalidatePath("/admin/team");
}
