"use client";

import { GanttContent } from "@/components/gantt/gantt-chart";
import { GanttToolbar } from "@/components/gantt/gantt-toolbar";
import { TaskCreateDialog } from "@/components/gantt/task-create-dialog";
import { TaskEditDialog } from "@/components/gantt/task-edit-dialog";
import { SprintDetailSheet } from "@/components/gantt/sprint-detail-sheet";
import { CapacityChart } from "@/components/capacity/capacity-chart";
import { getTimeRange, getMinWidth } from "@/components/gantt/packing";
import type {
  GanttTask,
  GanttSprint,
  GanttProject,
} from "@/components/gantt/packing";
import { useGanttStore } from "@/store/gantt-store";
import { useMemo, useState } from "react";
import { BarChart3, TrendingUp, Users, FolderKanban } from "lucide-react";

type Member = {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  dateArrivee: string;
  dateDepart: string | null;
  isResource: boolean;
};
type Project = { id: string; nom: string; client: string; status: string };
type ProjectWithDates = {
  id: string;
  nom: string;
  client: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  _count: { tasks: number; sprints: number };
};
type Technology = {
  id: string;
  nom: string;
  couleur: string;
  iconName: string;
};
type SprintFromServer = {
  id: string;
  titre: string;
  description: string | null;
  dateDebut: string;
  dateFin: string;
  projectId: string;
  project: { id: string; nom: string; client: string; status: string };
  _count: { tasks: number };
};

interface DashboardClientProps {
  tasks: GanttTask[];
  members: Member[];
  projects: Project[];
  projectsWithDates: ProjectWithDates[];
  technologies: Technology[];
  sprints: SprintFromServer[];
}

export function DashboardClient({
  tasks,
  members,
  projects,
  projectsWithDates,
  technologies,
  sprints: rawSprints,
}: DashboardClientProps) {
  const {
    zoom,
    filterMemberId,
    filterProjectId,
    groupBy,
    viewMode,
    showLoad,
    collapsedSprintIds,
    toggleSprintCollapsed,
  } = useGanttStore();
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<GanttSprint | null>(
    null
  );
  const [sprintSheetOpen, setSprintSheetOpen] = useState(false);

  // Map server sprints to GanttSprint
  const ganttSprints: GanttSprint[] = useMemo(
    () =>
      rawSprints.map((s) => ({
        id: s.id,
        titre: s.titre,
        type: "SPRINT" as const,
        description: s.description,
        dateDebut: s.dateDebut,
        dateFin: s.dateFin,
        projectId: s.projectId,
        project: s.project,
        taskCount: s._count.tasks,
      })),
    [rawSprints]
  );

  // Map projects to GanttProject (for macro view)
  const ganttProjects: GanttProject[] = useMemo(
    () =>
      projectsWithDates
        .filter((p) => p.startDate && p.endDate)
        .map((p) => ({
          id: p.id,
          nom: p.nom,
          client: p.client,
          status: p.status,
          dateDebut: p.startDate!,
          dateFin: p.endDate!,
          sprintCount: p._count.sprints,
          taskCount: p._count.tasks,
        })),
    [projectsWithDates]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterMemberId && !t.members.some((m) => m.id === filterMemberId))
        return false;
      if (filterProjectId && t.projectId !== filterProjectId) return false;
      return true;
    });
  }, [tasks, filterMemberId, filterProjectId]);

  const filteredSprints = useMemo(() => {
    if (filterProjectId)
      return ganttSprints.filter((s) => s.projectId === filterProjectId);
    return ganttSprints;
  }, [ganttSprints, filterProjectId]);

  const allItems = useMemo(() => {
    if (viewMode === "macro") {
      return ganttProjects.map((p) => ({
        dateDebut: p.dateDebut,
        dateFin: p.dateFin,
      }));
    }
    return [
      ...filteredTasks.map((t) => ({
        dateDebut: t.dateDebut,
        dateFin: t.dateFin,
      })),
      ...filteredSprints.map((s) => ({
        dateDebut: s.dateDebut,
        dateFin: s.dateFin,
      })),
    ];
  }, [viewMode, filteredTasks, filteredSprints, ganttProjects]);

  const { start, end } = useMemo(() => getTimeRange(allItems), [allItems]);
  const minWidth = getMinWidth(start, end, zoom);

  // Stats
  const activeMembers = members.filter(
    (m) => !m.dateDepart && m.isResource !== false
  ).length;
  const activeProjects = projects.filter(
    (p) => p.status === "ACTIVE"
  ).length;
  const activeTasks = tasks.filter((t) => {
    const now = Date.now();
    return (
      new Date(t.dateDebut).getTime() <= now &&
      new Date(t.dateFin).getTime() >= now
    );
  }).length;

  function handleBarClick(task: GanttTask) {
    setEditingTask(task);
    setEditDialogOpen(true);
  }

  function handleSprintClick(sprint: GanttSprint) {
    setSelectedSprint(sprint);
    setSprintSheetOpen(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Vue d&apos;ensemble du planning et de la charge equipe
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Membres actifs"
          value={activeMembers}
          color="text-blue-500"
        />
        <StatCard
          icon={FolderKanban}
          label="Projets actifs"
          value={activeProjects}
          color="text-emerald-500"
        />
        <StatCard
          icon={BarChart3}
          label="Taches en cours"
          value={activeTasks}
          color="text-amber-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Taches totales"
          value={tasks.length}
          color="text-purple-500"
        />
      </div>

      {/* === BLOC SEAMLESS GANTT + CHART === */}
      <div className="rounded-2xl border border-border/40 bg-background shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-border/30 flex flex-wrap items-center justify-between gap-3">
          <GanttToolbar members={members} projects={projects} />
          {viewMode === "detail" && (
            <TaskCreateDialog
              members={members}
              projects={projects}
              technologies={technologies}
            />
          )}
        </div>

        {/* Gantt */}
        <GanttContent
          tasks={filteredTasks}
          sprints={filteredSprints}
          projects={ganttProjects}
          start={start}
          end={end}
          zoom={zoom}
          groupBy={groupBy}
          viewMode={viewMode}
          showLoad={showLoad}
          collapsedSprintIds={collapsedSprintIds}
          onTaskClick={handleBarClick}
          onSprintClick={handleSprintClick}
          onToggleCollapse={toggleSprintCollapsed}
        />

        {/* Capacity chart — only in detail view */}
        {viewMode === "detail" && (
          <>
            <div className="px-4">
              <div className="border-t border-border/20" />
            </div>

            <div className="px-4 pt-3 pb-1">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Taux de charge
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Capacite (membres actifs) vs Charge (somme des loads planifies)
              </p>
            </div>

            <div className="px-4 pb-4">
              <CapacityChart
                tasks={filteredTasks}
                members={members.filter((m) => m.isResource !== false)}
                start={start}
                end={end}
                zoom={zoom}
                minWidth={minWidth}
              />
            </div>
          </>
        )}
      </div>

      <TaskEditDialog
        task={editingTask}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        members={members}
        projects={projects}
        technologies={technologies}
      />

      <SprintDetailSheet
        sprint={selectedSprint}
        open={sprintSheetOpen}
        onOpenChange={setSprintSheetOpen}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-background p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-xl bg-muted/50 p-2.5 ${color}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-[11px] text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
