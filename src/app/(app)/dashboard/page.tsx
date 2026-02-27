export const dynamic = "force-dynamic";

import { getTasks } from "@/actions/tasks";
import { getMembers } from "@/actions/members";
import { getProjects, getProjectsWithDates } from "@/actions/projects";
import { getTechnologies } from "@/actions/technologies";
import { getSprints } from "@/actions/sprints";
import { DashboardClient } from "./client";

export default async function DashboardPage() {
  const [tasks, members, projects, projectsWithDates, technologies, sprints] =
    await Promise.all([
      getTasks(),
      getMembers(),
      getProjects(),
      getProjectsWithDates(),
      getTechnologies(),
      getSprints(),
    ]);

  return (
    <DashboardClient
      tasks={JSON.parse(JSON.stringify(tasks))}
      members={JSON.parse(JSON.stringify(members))}
      projects={JSON.parse(JSON.stringify(projects))}
      projectsWithDates={JSON.parse(JSON.stringify(projectsWithDates))}
      technologies={JSON.parse(JSON.stringify(technologies))}
      sprints={JSON.parse(JSON.stringify(sprints))}
    />
  );
}
