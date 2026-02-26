export const dynamic = "force-dynamic";

import { getMembers } from "@/actions/members";
import { TeamClient } from "./client";

export default async function TeamPage() {
  const members = await getMembers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Equipe</h1>
        <p className="text-muted-foreground">
          Gerez les membres de votre equipe et leur disponibilite.
        </p>
      </div>
      <TeamClient members={JSON.parse(JSON.stringify(members))} />
    </div>
  );
}
