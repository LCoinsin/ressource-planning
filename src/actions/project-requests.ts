"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/lib/require-permission";

const requestSchema = z.object({
  contactName: z.string().min(1, "Le nom est requis"),
  contactEmail: z.string().email("Email invalide"),
  description: z.string().min(10, "La description doit faire au moins 10 caracteres"),
  desiredDate: z.string().optional().nullable(),
});

// Public — no auth required
export async function createProjectRequest(
  data: z.infer<typeof requestSchema>
) {
  const parsed = requestSchema.parse(data);
  await prisma.projectRequest.create({
    data: {
      contactName: parsed.contactName,
      contactEmail: parsed.contactEmail,
      description: parsed.description,
      desiredDate: parsed.desiredDate ? new Date(parsed.desiredDate) : null,
      status: "PENDING",
    },
  });
  revalidatePath("/admin/requests");
}

// Admin only
export async function getProjectRequests() {
  await requirePermission(PERMISSIONS.CAN_VIEW_REQUESTS);
  return prisma.projectRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateRequestStatus(
  id: string,
  status: "ACCEPTED" | "REJECTED"
) {
  await requirePermission(PERMISSIONS.CAN_VIEW_REQUESTS);
  await prisma.projectRequest.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/requests");
}

export async function deleteProjectRequest(id: string) {
  await requirePermission(PERMISSIONS.CAN_VIEW_REQUESTS);
  await prisma.projectRequest.delete({ where: { id } });
  revalidatePath("/admin/requests");
}
