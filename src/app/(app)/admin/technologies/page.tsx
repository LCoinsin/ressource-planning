export const dynamic = "force-dynamic";

import { getTechnologies } from "@/actions/technologies";
import { TechnologiesClient } from "./client";

export default async function TechnologiesPage() {
  const technologies = await getTechnologies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Technologies</h1>
        <p className="text-muted-foreground">
          Gerez les technologies utilisees dans vos projets.
        </p>
      </div>
      <TechnologiesClient technologies={technologies} />
    </div>
  );
}
