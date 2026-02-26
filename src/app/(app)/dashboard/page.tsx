export const dynamic = "force-dynamic";

import { getTasks } from "@/actions/tasks";
import { getMembers } from "@/actions/members";
import { getProjects } from "@/actions/projects";
import { getTechnologies } from "@/actions/technologies";
import { DashboardClient } from "./client";

export default async function DashboardPage() {
  const [tasks, members, projects, technologies] = await Promise.all([
    getTasks(),
    getMembers(),
    getProjects(),
    getTechnologies(),
  ]);

  return (
    <DashboardClient
      tasks={JSON.parse(JSON.stringify(tasks))}
      members={JSON.parse(JSON.stringify(members))}
      projects={JSON.parse(JSON.stringify(projects))}
      technologies={JSON.parse(JSON.stringify(technologies))}
    />
  );
}
