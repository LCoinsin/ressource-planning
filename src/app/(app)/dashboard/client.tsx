"use client";

import { GanttContent } from "@/components/gantt/gantt-chart";
import { GanttToolbar } from "@/components/gantt/gantt-toolbar";
import { TaskCreateDialog } from "@/components/gantt/task-create-dialog";
import { TaskEditDialog } from "@/components/gantt/task-edit-dialog";
import { CapacityChart } from "@/components/capacity/capacity-chart";
import { getTimeRange, getMinWidth } from "@/components/gantt/packing";
import type { GanttTask } from "@/components/gantt/packing";
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
type Technology = {
  id: string;
  nom: string;
  couleur: string;
  iconName: string;
};

interface DashboardClientProps {
  tasks: GanttTask[];
  members: Member[];
  projects: Project[];
  technologies: Technology[];
}

export function DashboardClient({
  tasks,
  members,
  projects,
  technologies,
}: DashboardClientProps) {
  const { zoom, filterMemberId, filterProjectId, groupBy } = useGanttStore();
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterMemberId && !t.members.some((m) => m.id === filterMemberId))
        return false;
      if (filterProjectId && t.projectId !== filterProjectId) return false;
      return true;
    });
  }, [tasks, filterMemberId, filterProjectId]);

  const { start, end } = useMemo(
    () => getTimeRange(filteredTasks),
    [filteredTasks]
  );
  const minWidth = getMinWidth(start, end, zoom);

  // Stats — exclude non-resource members (admins) from active count
  const activeMembers = members.filter((m) => !m.dateDepart && m.isResource !== false).length;
  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
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
          <TaskCreateDialog
            members={members}
            projects={projects}
            technologies={technologies}
          />
        </div>

        {/* Gantt — sans bordure propre */}
        <GanttContent
          tasks={filteredTasks}
          start={start}
          end={end}
          zoom={zoom}
          groupBy={groupBy}
          onBarClick={handleBarClick}
        />

        {/* Separateur subtil */}
        <div className="px-4">
          <div className="border-t border-border/20" />
        </div>

        {/* Titre section charge */}
        <div className="px-4 pt-3 pb-1">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Taux de charge
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Capacite (membres actifs) vs Charge (somme des loads planifies)
          </p>
        </div>

        {/* Chart — meme padding-x que le Gantt */}
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
      </div>

      <TaskEditDialog
        task={editingTask}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        members={members}
        projects={projects}
        technologies={technologies}
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
