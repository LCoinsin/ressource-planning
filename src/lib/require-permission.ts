import { auth } from "@/lib/auth";
import type { Permission } from "@/lib/permissions";

export async function requirePermission(permission: Permission) {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifie");
  const perms = session.user.permissions || [];
  if (!perms.includes(permission) && session.user.role !== "Admin") {
    throw new Error("Permission insuffisante");
  }
  return session;
}
