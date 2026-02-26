"use client";

import { useMemo, useState } from "react";
import { useGanttStore } from "@/store/gantt-store";
import { GanttHeader } from "./gantt-header";
import { GanttBar } from "./gantt-bar";
import { GanttToolbar } from "./gantt-toolbar";
import { TaskEditDialog } from "./task-edit-dialog";
import { TaskCreateDialog } from "./task-create-dialog";
import {
  groupAndPack,
  getTimeRange,
  getBarPositionPercent,
  getMinWidth,
} from "./packing";
import type { GanttTask } from "./packing";
import { differenceInDays } from "date-fns";
import type { ZoomLevel } from "@/store/gantt-store";

const LANE_HEIGHT = 40;

type Member = { id: string; nom: string; prenom: string };
type Project = { id: string; nom: string };
type Technology = { id: string; nom: string; couleur: string };

interface GanttChartProps {
  tasks: GanttTask[];
  members: Member[];
  projects: Project[];
  technologies: Technology[];
}

/** Inner Gantt rendering (lanes + header) — no border/wrapper, for seamless embedding */
export function GanttContent({
  tasks,
  start,
  end,
  zoom,
  groupBy,
  onBarClick,
}: {
  tasks: GanttTask[];
  start: Date;
  end: Date;
  zoom: ZoomLevel;
  groupBy: "none" | "member" | "project";
  onBarClick?: (task: GanttTask) => void;
}) {
  const totalDays = differenceInDays(end, start) + 1;
  const minWidth = getMinWidth(start, end, zoom);

  const groups = useMemo(
    () => groupAndPack(tasks, groupBy),
    [tasks, groupBy]
  );

  return (
    <div className="overflow-auto">
      <div style={{ minWidth: Math.max(minWidth, 800) }}>
        <GanttHeader start={start} end={end} zoom={zoom} />

        {groups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div className="px-4 py-2 bg-muted/30 border-b border-border/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky left-0">
                {group.label}
              </div>
            )}
            {group.lanes.map((lane, li) => (
              <div
                key={li}
                className="relative border-b border-border/20"
                style={{ height: LANE_HEIGHT }}
              >
                {/* Today line */}
                {(() => {
                  const todayOffset = differenceInDays(new Date(), start);
                  if (todayOffset >= 0 && todayOffset <= totalDays) {
                    return (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-primary/40 z-[1]"
                        style={{
                          left: `${(todayOffset / totalDays) * 100}%`,
                        }}
                      />
                    );
                  }
                  return null;
                })()}

                {lane.tasks.map((task) => {
                  const { left, width } = getBarPositionPercent(
                    task.dateDebut,
                    task.dateFin,
                    start,
                    end,
                    zoom
                  );
                  return (
                    <GanttBar
                      key={task.id}
                      task={task}
                      left={left}
                      width={width}
                      onClick={onBarClick ?? (() => {})}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center text-muted-foreground py-16 text-sm">
            Aucune tache a afficher
          </div>
        )}
      </div>
    </div>
  );
}

/** Full GanttChart with toolbar, borders, and edit dialogs — standalone usage */
export function GanttChart({
  tasks,
  members,
  projects,
  technologies,
}: GanttChartProps) {
  const { filterMemberId, filterProjectId, groupBy, zoom } = useGanttStore();
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

  function handleBarClick(task: GanttTask) {
    setEditingTask(task);
    setEditDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <GanttToolbar members={members} projects={projects} />
        <TaskCreateDialog
          members={members}
          projects={projects}
          technologies={technologies}
        />
      </div>

      <div className="rounded-2xl border border-border/40 overflow-auto bg-background shadow-sm">
        <GanttContent
          tasks={filteredTasks}
          start={start}
          end={end}
          zoom={zoom}
          groupBy={groupBy}
          onBarClick={handleBarClick}
        />
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
