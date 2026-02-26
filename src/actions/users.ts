"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/lib/require-permission";

const createUserSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prenom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(4, "Minimum 4 caracteres"),
  role: z.string().min(1, "Le role metier est requis"),
  roleId: z.string().optional().nullable(),
  dateArrivee: z.string().min(1, "La date d'arrivee est requise"),
});

const updateUserSchema = z.object({
  email: z.string().email("Email invalide"),
  roleId: z.string().optional().nullable(),
  isActive: z.boolean(),
});

export async function getUsers() {
  return prisma.member.findMany({
    where: { email: { not: null } },
    orderBy: { nom: "asc" },
    include: { appRole: true },
  });
}

export async function createUser(data: z.infer<typeof createUserSchema>) {
  await requirePermission(PERMISSIONS.CAN_MANAGE_USERS);
  const parsed = createUserSchema.parse(data);
  const hash = bcryptjs.hashSync(parsed.password, 10);
  await prisma.member.create({
    data: {
      nom: parsed.nom,
      prenom: parsed.prenom,
      role: parsed.role,
      email: parsed.email,
      passwordHash: hash,
      isActive: true,
      roleId: parsed.roleId || null,
      dateArrivee: new Date(parsed.dateArrivee),
    },
  });
  revalidatePath("/admin/users");
  revalidatePath("/admin/team");
}

export async function updateUser(
  id: string,
  data: z.infer<typeof updateUserSchema>
) {
  await requirePermission(PERMISSIONS.CAN_MANAGE_USERS);
  const parsed = updateUserSchema.parse(data);
  await prisma.member.update({
    where: { id },
    data: {
      email: parsed.email,
      roleId: parsed.roleId || null,
      isActive: parsed.isActive,
    },
  });
  revalidatePath("/admin/users");
}

export async function resetPassword(id: string, newPassword: string) {
  await requirePermission(PERMISSIONS.CAN_MANAGE_USERS);
  if (!newPassword || newPassword.length < 4) {
    throw new Error("Le mot de passe doit faire au moins 4 caracteres");
  }
  const hash = bcryptjs.hashSync(newPassword, 10);
  await prisma.member.update({
    where: { id },
    data: { passwordHash: hash },
  });
  revalidatePath("/admin/users");
}

export async function deleteUser(id: string) {
  await requirePermission(PERMISSIONS.CAN_MANAGE_USERS);
  await prisma.member.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/admin/users");
}
