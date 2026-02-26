"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/lib/require-permission";

const roleSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  permissions: z.array(z.string()),
});

export async function getRoles() {
  return prisma.role.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { members: true } } },
  });
}

export async function createRole(data: z.infer<typeof roleSchema>) {
  await requirePermission(PERMISSIONS.CAN_MANAGE_ROLES);
  const parsed = roleSchema.parse(data);
  await prisma.role.create({
    data: {
      name: parsed.name,
      permissions: JSON.stringify(parsed.permissions),
    },
  });
  revalidatePath("/admin/roles");
}

export async function updateRole(
  id: string,
  data: z.infer<typeof roleSchema>
) {
  await requirePermission(PERMISSIONS.CAN_MANAGE_ROLES);
  const parsed = roleSchema.parse(data);
  await prisma.role.update({
    where: { id },
    data: {
      name: parsed.name,
      permissions: JSON.stringify(parsed.permissions),
    },
  });
  revalidatePath("/admin/roles");
}

export async function deleteRole(id: string) {
  await requirePermission(PERMISSIONS.CAN_MANAGE_ROLES);
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { members: true } } },
  });
  if (role && role._count.members > 0) {
    throw new Error("Ce role est assigne a des membres. Retirez-le d'abord.");
  }
  await prisma.role.delete({ where: { id } });
  revalidatePath("/admin/roles");
}
