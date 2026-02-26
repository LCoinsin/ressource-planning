export const dynamic = "force-dynamic";

import { getUsers } from "@/actions/users";
import { getRoles } from "@/actions/roles";
import { UsersClient } from "./client";

export default async function UsersPage() {
  const [users, roles] = await Promise.all([getUsers(), getRoles()]);

  const serialized = users.map((u) => ({
    ...u,
    dateArrivee: u.dateArrivee.toISOString(),
    dateDepart: u.dateDepart?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
    appRole: u.appRole
      ? { ...u.appRole, createdAt: u.appRole.createdAt.toISOString() }
      : null,
  }));

  const serializedRoles = roles.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">
          Gestion des comptes utilisateurs et de leurs roles
        </p>
      </div>
      <UsersClient users={serialized} roles={serializedRoles} />
    </div>
  );
}
