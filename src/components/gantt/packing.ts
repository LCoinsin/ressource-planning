import type { ZoomLevel } from "@/store/gantt-store";
import {
  differenceInDays,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfDay,
} from "date-fns";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GanttTask {
  id: string;
  titre: string;
  type: string; // "TASK"
  dateDebut: string;
  dateFin: string;
  load: number;
  isCompleted: boolean;
  projectId: string;
  sprintId: string | null;
  technologyId: string | null;
  project: { id: string; nom: string; client: string; status: string };
  members: { id: string; nom: string; prenom: string }[];
  technology: {
    id: string;
    nom: string;
    couleur: string;
    iconName: string;
    customSvg?: string | null;
  } | null;
}

export interface GanttSprint {
  id: string;
  titre: string;
  type: "SPRINT";
  description: string | null;
  dateDebut: string;
  dateFin: string;
  projectId: string;
  project: { id: string; nom: string; client: string; status: string };
  taskCount: number;
}

export interface GanttProject {
  id: string;
  nom: string;
  client: string;
  status: string;
  dateDebut: string;
  dateFin: string;
  sprintCount: number;
  taskCount: number;
}

/** Union of everything that can appear as a bar on the Gantt */
export type GanttItem = GanttTask | GanttSprint | GanttProject;

export interface PackedLane<T = GanttItem> {
  tasks: T[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStart(item: { dateDebut: string }): string {
  return item.dateDebut;
}

function getEnd(item: { dateFin: string }): string {
  return item.dateFin;
}

/* ------------------------------------------------------------------ */
/*  Packing                                                            */
/* ------------------------------------------------------------------ */

/**
 * Generic packing: place items into lanes so non-overlapping items share rows.
 * Same-day end/start = collision (items go on separate lanes).
 */
export function packItems<T extends { dateDebut: string; dateFin: string }>(
  items: T[]
): PackedLane<T>[] {
  const sorted = [...items].sort(
    (a, b) =>
      new Date(getStart(a)).getTime() - new Date(getStart(b)).getTime()
  );

  const lanes: PackedLane<T>[] = [];

  for (const item of sorted) {
    const itemStartDay = startOfDay(new Date(getStart(item))).getTime();

    let placed = false;
    for (const lane of lanes) {
      const lastItem = lane.tasks[lane.tasks.length - 1];
      const lastEndDay = startOfDay(new Date(getEnd(lastItem))).getTime();

      if (itemStartDay > lastEndDay) {
        lane.tasks.push(item);
        placed = true;
        break;
      }
    }

    if (!placed) {
      lanes.push({ tasks: [item] });
    }
  }

  return lanes;
}

/** Backward-compatible alias */
export function packTasks(tasks: GanttTask[]): PackedLane<GanttTask>[] {
  return packItems(tasks);
}

/* ------------------------------------------------------------------ */
/*  Grouping                                                           */
/* ------------------------------------------------------------------ */

/**
 * Group tasks/sprints then pack each group.
 */
export function groupAndPack(
  items: (GanttTask | GanttSprint)[],
  groupBy: "none" | "member" | "project"
): { label: string; lanes: PackedLane<GanttTask | GanttSprint>[] }[] {
  if (groupBy === "none") {
    return [{ label: "", lanes: packItems(items) }];
  }

  const groups = new Map<
    string,
    { label: string; items: (GanttTask | GanttSprint)[] }
  >();

  for (const item of items) {
    if (groupBy === "member") {
      const members = "members" in item ? item.members : [];

      if (members.length === 0) {
        const key = "non-assigne";
        if (!groups.has(key))
          groups.set(key, { label: "Non assigne", items: [] });
        groups.get(key)!.items.push(item);
      } else {
        for (const member of members) {
          const key = member.id;
          const label = `${member.prenom} ${member.nom}`;
          if (!groups.has(key)) groups.set(key, { label, items: [] });
          groups.get(key)!.items.push(item);
        }
      }
    } else {
      const key = item.projectId;
      const label = item.project.nom;
      if (!groups.has(key)) groups.set(key, { label, items: [] });
      groups.get(key)!.items.push(item);
    }
  }

  return Array.from(groups.values()).map((g) => ({
    label: g.label,
    lanes: packItems(g.items),
  }));
}

/* ------------------------------------------------------------------ */
/*  Hierarchical: Sprint sections with child tasks                     */
/* ------------------------------------------------------------------ */

export interface SprintSection {
  sprint: GanttSprint;
  taskLanes: PackedLane<GanttTask>[];
}

export interface HierarchicalResult {
  /** Sections: one per sprint (sprint bar + packed child tasks) */
  sprintSections: SprintSection[];
  /** Orphan tasks (sprintId === null) packed into lanes */
  orphanLanes: PackedLane<GanttTask>[];
}

/**
 * Build a hierarchical structure: sprint rows + child tasks below,
 * plus orphan tasks (no sprint) in their own section.
 */
export function buildHierarchy(
  sprints: GanttSprint[],
  tasks: GanttTask[]
): HierarchicalResult {
  const tasksBySprint = new Map<string, GanttTask[]>();
  const orphanTasks: GanttTask[] = [];

  for (const task of tasks) {
    if (task.sprintId) {
      if (!tasksBySprint.has(task.sprintId)) {
        tasksBySprint.set(task.sprintId, []);
      }
      tasksBySprint.get(task.sprintId)!.push(task);
    } else {
      orphanTasks.push(task);
    }
  }

  // Sort sprints by start date
  const sortedSprints = [...sprints].sort(
    (a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
  );

  const sprintSections: SprintSection[] = sortedSprints.map((sprint) => ({
    sprint,
    taskLanes: packItems(tasksBySprint.get(sprint.id) ?? []),
  }));

  return {
    sprintSections,
    orphanLanes: packItems(orphanTasks),
  };
}

/**
 * Pack projects for Macro view.
 */
export function packProjects(
  projects: GanttProject[]
): PackedLane<GanttProject>[] {
  return packItems(projects);
}

/* ------------------------------------------------------------------ */
/*  Time range                                                         */
/* ------------------------------------------------------------------ */

export function getTimeRange(
  items: { dateDebut: string; dateFin: string }[]
): { start: Date; end: Date } {
  if (items.length === 0) {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    const end = new Date(now);
    end.setDate(end.getDate() + 30);
    return { start, end };
  }

  let minDate = new Date(items[0].dateDebut);
  let maxDate = new Date(items[0].dateFin);

  for (const item of items) {
    const s = new Date(item.dateDebut);
    const e = new Date(item.dateFin);
    if (s < minDate) minDate = s;
    if (e > maxDate) maxDate = e;
  }

  const start = new Date(minDate);
  start.setDate(start.getDate() - 3);
  const end = new Date(maxDate);
  end.setDate(end.getDate() + 3);

  return { start, end };
}

/* ------------------------------------------------------------------ */
/*  Zoom helpers                                                       */
/* ------------------------------------------------------------------ */

export const COLUMN_WIDTHS: Record<ZoomLevel, number> = {
  day: 32,
  week: 90,
  month: 130,
};

export function getUnitsCount(
  start: Date,
  end: Date,
  zoom: ZoomLevel
): number {
  switch (zoom) {
    case "day":
      return differenceInDays(end, start) + 1;
    case "week":
      return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).length;
    case "month":
      return eachMonthOfInterval({ start, end }).length;
  }
}

export function getBarPositionPercent(
  taskStart: string,
  taskEnd: string,
  rangeStart: Date,
  rangeEnd: Date,
  _zoom: ZoomLevel
): { left: number; width: number } {
  const totalDays = differenceInDays(rangeEnd, rangeStart) + 1;

  const s = differenceInDays(new Date(taskStart), rangeStart);
  const e = differenceInDays(new Date(taskEnd), rangeStart);
  const left = (s / totalDays) * 100;
  const width = ((e - s + 1) / totalDays) * 100;

  return { left, width: Math.max(width, 0.3) };
}

export function getMinWidth(
  start: Date,
  end: Date,
  zoom: ZoomLevel
): number {
  const totalDays = differenceInDays(end, start) + 1;
  return (
    (totalDays * COLUMN_WIDTHS[zoom]) /
    (zoom === "day" ? 1 : zoom === "week" ? 7 : 30)
  );
}
