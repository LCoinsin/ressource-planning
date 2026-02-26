export const dynamic = "force-dynamic";

import { getRoles } from "@/actions/roles";
import { RolesClient } from "./client";

export default async function RolesPage() {
  const roles = await getRoles();

  const serialized = roles.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
        <p className="text-sm text-muted-foreground">
          Gestion des roles et permissions
        </p>
      </div>
      <RolesClient roles={serialized} />
    </div>
  );
}
