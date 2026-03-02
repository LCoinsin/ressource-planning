"use client";

import { useMemo, useState } from "react";
import { useGanttStore } from "@/store/gantt-store";
import { GanttHeader } from "./gantt-header";
import { GanttBar, SprintBar, ProjectBar } from "./gantt-bar";
import { GanttToolbar } from "./gantt-toolbar";
import { TaskEditDialog } from "./task-edit-dialog";
import { TaskCreateDialog } from "./task-create-dialog";
import { SprintDetailSheet } from "./sprint-detail-sheet";
import {
  buildHierarchy,
  packProjects,
  packItems,
  getTimeRange,
  getBarPositionPercent,
  getMinWidth,
} from "./packing";
import type {
  GanttTask,
  GanttSprint,
  GanttProject,
} from "./packing";
import { differenceInDays } from "date-fns";
import type { ZoomLevel } from "@/store/gantt-store";

const LANE_HEIGHT = 48;

type Member = { id: string; nom: string; prenom: string };
type Project = { id: string; nom: string };
type Technology = { id: string; nom: string; couleur: string };

interface GanttChartProps {
  tasks: GanttTask[];
  sprints: GanttSprint[];
  projects: GanttProject[];
  memberList: Member[];
  projectList: Project[];
  technologies: Technology[];
}

/* ------------------------------------------------------------------ */
/*  Shared: Today line                                                 */
/* ------------------------------------------------------------------ */

function TodayLine({ start, totalDays }: { start: Date; totalDays: number }) {
  const todayOffset = differenceInDays(new Date(), start);
  if (todayOffset < 0 || todayOffset > totalDays) return null;
  return (
    <div
      className="absolute top-0 bottom-0 w-px bg-primary/40 z-[1]"
      style={{ left: `${(todayOffset / totalDays) * 100}%` }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Detail view: hierarchical sprint sections + orphans                */
/* ------------------------------------------------------------------ */

function GanttContentDetail({
  tasks,
  sprints,
  start,
  end,
  zoom,
  showLoad,
  collapsedSprintIds,
  onTaskClick,
  onSprintClick,
  onToggleCollapse,
}: {
  tasks: GanttTask[];
  sprints: GanttSprint[];
  start: Date;
  end: Date;
  zoom: ZoomLevel;
  showLoad: boolean;
  collapsedSprintIds: Set<string>;
  onTaskClick?: (task: GanttTask) => void;
  onSprintClick?: (sprint: GanttSprint) => void;
  onToggleCollapse: (sprintId: string) => void;
}) {
  const totalDays = differenceInDays(end, start) + 1;
  const minWidth = getMinWidth(start, end, zoom);

  const hierarchy = useMemo(
    () => buildHierarchy(sprints, tasks),
    [sprints, tasks]
  );

  return (
    <div className="overflow-auto">
      <div style={{ minWidth: Math.max(minWidth, 800) }}>
        <GanttHeader start={start} end={end} zoom={zoom} />

        {/* Sprint sections */}
        {hierarchy.sprintSections.map((section) => {
          const collapsed = collapsedSprintIds.has(section.sprint.id);
          const { left, width } = getBarPositionPercent(
            section.sprint.dateDebut,
            section.sprint.dateFin,
            start,
            end,
            zoom
          );

          return (
            <div key={section.sprint.id}>
              {/* Sprint bar lane */}
              <div
                className="relative border-b border-border/20"
                style={{ height: LANE_HEIGHT }}
              >
                <TodayLine start={start} totalDays={totalDays} />
                <SprintBar
                  sprint={section.sprint}
                  left={left}
                  width={width}
                  collapsed={collapsed}
                  onClick={onSprintClick ?? (() => {})}
                  onToggleCollapse={() => onToggleCollapse(section.sprint.id)}
                />
              </div>

              {/* Child task lanes — hidden when collapsed */}
              {!collapsed &&
                section.taskLanes.map((lane, li) => (
                  <div
                    key={li}
                    className="relative border-b border-border/20 bg-muted/10"
                    style={{ height: LANE_HEIGHT }}
                  >
                    <TodayLine start={start} totalDays={totalDays} />
                    {lane.tasks.map((task) => {
                      const pos = getBarPositionPercent(
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
                          left={pos.left}
                          width={pos.width}
                          showLoad={showLoad}
                          onClick={onTaskClick ?? (() => {})}
                        />
                      );
                    })}
                  </div>
                ))}
            </div>
          );
        })}

        {/* Orphan tasks (no sprint) */}
        {hierarchy.orphanLanes.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-muted/30 border-b border-border/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky left-0">
              Hors sprint
            </div>
            {hierarchy.orphanLanes.map((lane, li) => (
              <div
                key={li}
                className="relative border-b border-border/20"
                style={{ height: LANE_HEIGHT }}
              >
                <TodayLine start={start} totalDays={totalDays} />
                {lane.tasks.map((task) => {
                  const pos = getBarPositionPercent(
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
                      left={pos.left}
                      width={pos.width}
                      onClick={onTaskClick ?? (() => {})}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {sprints.length === 0 && tasks.length === 0 && (
          <div className="text-center text-muted-foreground py-16 text-sm">
            Aucune tache a afficher
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Macro view content (projects only)                                 */
/* ------------------------------------------------------------------ */

function GanttContentMacro({
  projects,
  start,
  end,
  zoom,
}: {
  projects: GanttProject[];
  start: Date;
  end: Date;
  zoom: ZoomLevel;
}) {
  const totalDays = differenceInDays(end, start) + 1;
  const minWidth = getMinWidth(start, end, zoom);

  const lanes = useMemo(() => packProjects(projects), [projects]);

  return (
    <div className="overflow-auto">
      <div style={{ minWidth: Math.max(minWidth, 800) }}>
        <GanttHeader start={start} end={end} zoom={zoom} />

        {lanes.map((lane, li) => (
          <div
            key={li}
            className="relative border-b border-border/20"
            style={{ height: LANE_HEIGHT }}
          >
            <TodayLine start={start} totalDays={totalDays} />
            {lane.tasks.map((project) => {
              const { left, width } = getBarPositionPercent(
                project.dateDebut,
                project.dateFin,
                start,
                end,
                zoom
              );
              return (
                <ProjectBar
                  key={project.id}
                  project={project}
                  left={left}
                  width={width}
                />
              );
            })}
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center text-muted-foreground py-16 text-sm">
            Aucun projet avec des dates a afficher
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Unified GanttContent (for dashboard embedding)                     */
/* ------------------------------------------------------------------ */

export function GanttContent({
  tasks,
  sprints,
  projects,
  start,
  end,
  zoom,
  viewMode,
  showLoad,
  collapsedSprintIds,
  onTaskClick,
  onSprintClick,
  onToggleCollapse,
}: {
  tasks: GanttTask[];
  sprints: GanttSprint[];
  projects: GanttProject[];
  start: Date;
  end: Date;
  zoom: ZoomLevel;
  groupBy: "none" | "member" | "project";
  viewMode: "detail" | "macro";
  showLoad: boolean;
  collapsedSprintIds: Set<string>;
  onTaskClick?: (task: GanttTask) => void;
  onSprintClick?: (sprint: GanttSprint) => void;
  onToggleCollapse: (sprintId: string) => void;
}) {
  if (viewMode === "macro") {
    return (
      <GanttContentMacro
        projects={projects.filter((p) => p.dateDebut && p.dateFin)}
        start={start}
        end={end}
        zoom={zoom}
      />
    );
  }

  return (
    <GanttContentDetail
      tasks={tasks}
      sprints={sprints}
      start={start}
      end={end}
      zoom={zoom}
      showLoad={showLoad}
      collapsedSprintIds={collapsedSprintIds}
      onTaskClick={onTaskClick}
      onSprintClick={onSprintClick}
      onToggleCollapse={onToggleCollapse}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Full standalone GanttChart                                         */
/* ------------------------------------------------------------------ */

export function GanttChart({
  tasks,
  sprints,
  projects,
  memberList,
  projectList,
  technologies,
}: GanttChartProps) {
  const {
    filterMemberId,
    filterProjectId,
    groupBy,
    zoom,
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
      return sprints.filter((s) => s.projectId === filterProjectId);
    return sprints;
  }, [sprints, filterProjectId]);

  const allItems = useMemo(() => {
    if (viewMode === "macro") {
      return projects
        .filter((p) => p.dateDebut && p.dateFin)
        .map((p) => ({ dateDebut: p.dateDebut, dateFin: p.dateFin }));
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
  }, [viewMode, filteredTasks, filteredSprints, projects]);

  const { start, end } = useMemo(() => getTimeRange(allItems), [allItems]);

  function handleBarClick(task: GanttTask) {
    setEditingTask(task);
    setEditDialogOpen(true);
  }

  function handleSprintClick(sprint: GanttSprint) {
    setSelectedSprint(sprint);
    setSprintSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <GanttToolbar members={memberList} projects={projectList} />
        {viewMode === "detail" && (
          <TaskCreateDialog
            members={memberList}
            projects={projectList}
            technologies={technologies}
          />
        )}
      </div>

      <div className="rounded-2xl border border-border/40 overflow-auto bg-background shadow-sm">
        <GanttContent
          tasks={filteredTasks}
          sprints={filteredSprints}
          projects={projects}
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
      </div>

      <TaskEditDialog
        task={editingTask}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        members={memberList}
        projects={projectList}
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
