export const dynamic = "force-dynamic";

import { getProjects } from "@/actions/projects";
import { ProjectsClient } from "./client";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projets</h1>
        <p className="text-muted-foreground">
          Gerez vos projets et leur statut.
        </p>
      </div>
      <ProjectsClient projects={JSON.parse(JSON.stringify(projects))} />
    </div>
  );
}
