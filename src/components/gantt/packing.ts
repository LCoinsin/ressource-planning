import type { ZoomLevel } from "@/store/gantt-store";
import {
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachDayOfInterval,
} from "date-fns";

export interface GanttTask {
  id: string;
  titre: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  load: number;
  projectId: string;
  technologyId: string | null;
  project: { id: string; nom: string; client: string; status: string };
  members: { id: string; nom: string; prenom: string }[];
  technology: {
    id: string;
    nom: string;
    couleur: string;
    iconName: string;
  } | null;
}

export interface PackedLane {
  tasks: GanttTask[];
}

/**
 * Pack tasks into lanes so non-overlapping tasks share the same row.
 */
export function packTasks(tasks: GanttTask[]): PackedLane[] {
  const sorted = [...tasks].sort(
    (a, b) =>
      new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
  );

  const lanes: PackedLane[] = [];

  for (const task of sorted) {
    const taskStart = new Date(task.dateDebut).getTime();

    let placed = false;
    for (const lane of lanes) {
      const lastTask = lane.tasks[lane.tasks.length - 1];
      const lastEnd = new Date(lastTask.dateFin).getTime();

      if (taskStart >= lastEnd) {
        lane.tasks.push(task);
        placed = true;
        break;
      }
    }

    if (!placed) {
      lanes.push({ tasks: [task] });
    }
  }

  return lanes;
}

/**
 * Group tasks then pack each group.
 */
export function groupAndPack(
  tasks: GanttTask[],
  groupBy: "none" | "member" | "project"
): { label: string; lanes: PackedLane[] }[] {
  if (groupBy === "none") {
    return [{ label: "", lanes: packTasks(tasks) }];
  }

  const groups = new Map<string, { label: string; tasks: GanttTask[] }>();

  for (const task of tasks) {
    if (groupBy === "member") {
      if (task.members.length === 0) {
        const key = "non-assigne";
        if (!groups.has(key))
          groups.set(key, { label: "Non assigne", tasks: [] });
        groups.get(key)!.tasks.push(task);
      } else {
        for (const member of task.members) {
          const key = member.id;
          const label = `${member.prenom} ${member.nom}`;
          if (!groups.has(key)) groups.set(key, { label, tasks: [] });
          groups.get(key)!.tasks.push(task);
        }
      }
    } else {
      const key = task.projectId;
      const label = task.project.nom;
      if (!groups.has(key)) groups.set(key, { label, tasks: [] });
      groups.get(key)!.tasks.push(task);
    }
  }

  return Array.from(groups.values()).map((g) => ({
    label: g.label,
    lanes: packTasks(g.tasks),
  }));
}

/**
 * Calculate time range with padding.
 */
export function getTimeRange(tasks: GanttTask[]): { start: Date; end: Date } {
  if (tasks.length === 0) {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    const end = new Date(now);
    end.setDate(end.getDate() + 30);
    return { start, end };
  }

  let minDate = new Date(tasks[0].dateDebut);
  let maxDate = new Date(tasks[0].dateFin);

  for (const task of tasks) {
    const s = new Date(task.dateDebut);
    const e = new Date(task.dateFin);
    if (s < minDate) minDate = s;
    if (e > maxDate) maxDate = e;
  }

  const start = new Date(minDate);
  start.setDate(start.getDate() - 3);
  const end = new Date(maxDate);
  end.setDate(end.getDate() + 3);

  return { start, end };
}

// --- Zoom helpers ---

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
  zoom: ZoomLevel
): { left: number; width: number } {
  const totalDays = differenceInDays(rangeEnd, rangeStart) + 1;

  // Always use day-level precision for bar positioning regardless of zoom.
  // The zoom only affects header display and column width.
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
  return totalDays * COLUMN_WIDTHS[zoom] / (zoom === "day" ? 1 : zoom === "week" ? 7 : 30);
}
