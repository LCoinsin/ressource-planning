"use client";

import type { GanttTask, GanttSprint, GanttProject } from "./packing";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SafeSvgIcon } from "@/components/ui/safe-svg-icon";
import * as LucideIcons from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Task bar (Vue Detaillee)                                           */
/* ------------------------------------------------------------------ */

interface GanttBarProps {
  task: GanttTask;
  left: number;
  width: number;
  showLoad?: boolean;
  onClick: (task: GanttTask) => void;
}

function MemberAvatars({
  members,
}: {
  members: { prenom: string; nom: string }[];
}) {
  if (members.length === 0) return null;
  const shown = members.slice(0, 3);
  const extra = members.length - 3;

  return (
    <div className="flex -space-x-1.5 ml-auto flex-shrink-0">
      {shown.map((m, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-full bg-white/30 backdrop-blur border border-white/40 flex items-center justify-center text-[8px] font-bold"
          title={`${m.prenom} ${m.nom}`}
        >
          {m.prenom[0]}
          {m.nom[0]}
        </div>
      ))}
      {extra > 0 && (
        <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[8px] font-medium">
          +{extra}
        </div>
      )}
    </div>
  );
}

function TechIcon({ technology }: { technology: GanttTask["technology"] }) {
  if (!technology) return null;
  if (technology.customSvg) {
    return <SafeSvgIcon svg={technology.customSvg} className="w-3.5 h-3.5" />;
  }
  const pascalCase = technology.iconName
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[pascalCase] as
    | React.ComponentType<{ className?: string }>
    | undefined;
  if (!IconComponent) return null;
  return <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />;
}

export function GanttBar({ task, left, width, showLoad = true, onClick }: GanttBarProps) {
  const color = task.technology?.couleur ?? "#6B7280";
  const loadPerMember =
    task.members.length > 0
      ? Math.round((task.load / task.members.length) * 100)
      : Math.round(task.load * 100);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <button
            onClick={() => onClick(task)}
            className="absolute top-2 bottom-2 rounded-xl text-[11px] font-medium flex items-center gap-2 px-2.5 overflow-hidden cursor-pointer transition-all hover:brightness-110 hover:shadow-md shadow-sm"
            style={{
              left: `${left}%`,
              width: `${Math.max(width, 0.5)}%`,
              backgroundColor: color,
              color: "#fff",
            }}
          >
            {task.technology && <TechIcon technology={task.technology} />}
            <span className="truncate flex-1">{task.titre}</span>
            {width > 3 && <MemberAvatars members={task.members} />}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs rounded-xl border-border/50"
        >
          <div className="space-y-1.5">
            <p className="font-semibold">{task.titre}</p>
            <p className="text-xs text-muted-foreground">
              {task.project.nom}
              {task.technology && (
                <span
                  className="ml-1.5 inline-flex items-center gap-1"
                  style={{ color: task.technology.couleur }}
                >
                  {task.technology.nom}
                </span>
              )}
            </p>
            {task.members.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {task.members.map((m) => `${m.prenom} ${m.nom}`).join(", ")}
              </p>
            )}
            <p className="text-xs">
              {format(new Date(task.dateDebut), "dd MMM", { locale: fr })} -{" "}
              {format(new Date(task.dateFin), "dd MMM yyyy", { locale: fr })}
            </p>
            {showLoad && (
              <p className="text-xs">
                Charge : {Math.round(task.load * 100)}% total
                {task.members.length > 1 && ` (${loadPerMember}% / pers.)`}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Sprint bar (Vue Detaillee) — dashed border + task count badge      */
/* ------------------------------------------------------------------ */

interface SprintBarProps {
  sprint: GanttSprint;
  left: number;
  width: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClick: (sprint: GanttSprint) => void;
}

export function SprintBar({
  sprint,
  left,
  width,
  collapsed,
  onToggleCollapse,
  onClick,
}: SprintBarProps) {
  const color = "#6366F1"; // indigo for sprints
  const ChevronIcon = collapsed
    ? LucideIcons.ChevronRight
    : LucideIcons.ChevronDown;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <div
            className="absolute top-2 bottom-2 rounded-xl text-[11px] font-medium flex items-center gap-1 px-1.5 overflow-hidden cursor-pointer transition-all hover:brightness-110 hover:shadow-md border border-dashed"
            style={{
              left: `${left}%`,
              width: `${Math.max(width, 0.5)}%`,
              backgroundColor: `${color}15`,
              color: color,
              borderColor: `${color}60`,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              className="flex-shrink-0 p-0.5 rounded-md hover:bg-indigo-500/15 transition-colors"
              title={collapsed ? "Deplier les taches" : "Masquer les taches"}
            >
              <ChevronIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onClick(sprint)}
              className="flex items-center gap-2 flex-1 min-w-0 truncate"
            >
              <span className="truncate">{sprint.titre}</span>
            </button>
            {width > 3 && (
              <span
                className="flex-shrink-0 inline-flex items-center rounded-lg px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ backgroundColor: `${color}20` }}
              >
                {sprint.taskCount} tache{sprint.taskCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs rounded-xl border-border/50"
        >
          <div className="space-y-1.5">
            <p className="font-semibold">{sprint.titre}</p>
            <p className="text-xs text-muted-foreground">
              {sprint.project.nom}
            </p>
            <p className="text-xs">
              {format(new Date(sprint.dateDebut), "dd MMM", { locale: fr })} -{" "}
              {format(new Date(sprint.dateFin), "dd MMM yyyy", { locale: fr })}
            </p>
            <p className="text-xs">
              {sprint.taskCount} tache{sprint.taskCount !== 1 ? "s" : ""}
            </p>
            {sprint.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {sprint.description}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Project bar (Vue Macro)                                            */
/* ------------------------------------------------------------------ */

interface ProjectBarProps {
  project: GanttProject;
  left: number;
  width: number;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#10B981",
  PAUSED: "#F59E0B",
  DONE: "#6B7280",
};

export function ProjectBar({ project, left, width }: ProjectBarProps) {
  const color = STATUS_COLORS[project.status] ?? "#6B7280";

  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <div
            className="absolute top-2 bottom-2 rounded-xl text-[11px] font-medium flex items-center gap-2 px-3 overflow-hidden shadow-sm"
            style={{
              left: `${left}%`,
              width: `${Math.max(width, 0.5)}%`,
              backgroundColor: color,
              color: "#fff",
            }}
          >
            <span className="truncate flex-1 font-semibold">
              {project.nom}
            </span>
            {width > 4 && (
              <span className="flex-shrink-0 text-[10px] opacity-80">
                {project.client}
              </span>
            )}
            {width > 6 && (
              <span className="flex-shrink-0 inline-flex items-center rounded-lg bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
                {project.sprintCount}S · {project.taskCount}T
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs rounded-xl border-border/50"
        >
          <div className="space-y-1.5">
            <p className="font-semibold">{project.nom}</p>
            <p className="text-xs text-muted-foreground">{project.client}</p>
            <p className="text-xs">
              {format(new Date(project.dateDebut), "dd MMM", { locale: fr })} -{" "}
              {format(new Date(project.dateFin), "dd MMM yyyy", { locale: fr })}
            </p>
            <p className="text-xs">
              {project.sprintCount} sprint
              {project.sprintCount !== 1 ? "s" : ""} ·{" "}
              {project.taskCount} tache{project.taskCount !== 1 ? "s" : ""}
            </p>
            <p className="text-xs capitalize">{project.status.toLowerCase()}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
