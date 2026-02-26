export const dynamic = "force-dynamic";

import { getProjectRequests } from "@/actions/project-requests";
import { RequestsClient } from "./client";

export default async function RequestsPage() {
  const requests = await getProjectRequests();

  const serialized = requests.map((r) => ({
    ...r,
    desiredDate: r.desiredDate?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Demandes</h1>
        <p className="text-sm text-muted-foreground">
          Demandes de projets recues via le formulaire public
        </p>
      </div>
      <RequestsClient requests={serialized} />
    </div>
  );
}
