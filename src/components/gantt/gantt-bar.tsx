"use client";

import { cn } from "@/lib/utils";
import type { GanttTask } from "./packing";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface GanttBarProps {
  task: GanttTask;
  left: number;
  width: number;
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

export function GanttBar({ task, left, width, onClick }: GanttBarProps) {
  const isSprint = task.type === "SPRINT";
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
            className={cn(
              "absolute top-1 bottom-1 rounded-xl text-[11px] font-medium flex items-center gap-1 px-2.5 overflow-hidden cursor-pointer transition-all hover:brightness-110 hover:shadow-md",
              isSprint ? "border border-dashed" : "shadow-sm"
            )}
            style={{
              left: `${left}%`,
              width: `${Math.max(width, 0.5)}%`,
              backgroundColor: isSprint ? `${color}15` : color,
              color: isSprint ? color : "#fff",
              borderColor: isSprint ? `${color}60` : "transparent",
            }}
          >
            <span className="truncate flex-1">
              {isSprint ? task.project.nom : task.titre}
            </span>
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
            <p className="text-xs">
              Charge : {Math.round(task.load * 100)}% total
              {task.members.length > 1 && ` (${loadPerMember}% / pers.)`}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
