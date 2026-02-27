"use client";

import { useMemo } from "react";
import { GanttHeader } from "./gantt-header";
import {
  groupAndPack,
  getTimeRange,
  getBarPositionPercent,
  getMinWidth,
} from "./packing";
import type { GanttTask } from "./packing";
import { differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

const LANE_HEIGHT = 44;

interface GanttPublicProps {
  tasks: GanttTask[];
}

function AnonymousBar({
  color,
  left,
  width,
  isSprint,
}: {
  color: string;
  left: number;
  width: number;
  isSprint: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute top-2 bottom-2 rounded-xl",
        isSprint ? "border border-dashed opacity-60" : "shadow-sm opacity-80"
      )}
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 0.5)}%`,
        backgroundColor: isSprint ? `${color}20` : color,
        borderColor: isSprint ? `${color}60` : "transparent",
      }}
    />
  );
}

export function GanttPublic({ tasks }: GanttPublicProps) {
  const { start, end } = useMemo(() => getTimeRange(tasks), [tasks]);
  const totalDays = differenceInDays(end, start) + 1;
  const minWidth = getMinWidth(start, end, "week");

  const groups = useMemo(
    () => groupAndPack(tasks, "none"),
    [tasks]
  );

  return (
    <div className="overflow-auto">
      <div style={{ minWidth: Math.max(minWidth, 600) }}>
        <GanttHeader start={start} end={end} zoom="week" />

        {groups.map((group, gi) => (
          <div key={gi}>
            {group.lanes.map((lane, li) => (
              <div
                key={li}
                className="relative border-b border-border/10"
                style={{ height: LANE_HEIGHT }}
              >
                {/* Today line */}
                {(() => {
                  const todayOffset = differenceInDays(new Date(), start);
                  if (todayOffset >= 0 && todayOffset <= totalDays) {
                    return (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-primary/30 z-[1]"
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
                    "week"
                  );
                  const isSprint = "taskCount" in task;
                  const color =
                    "technology" in task
                      ? task.technology?.couleur ?? "#6B7280"
                      : "#6366F1";
                  return (
                    <AnonymousBar
                      key={task.id}
                      color={color}
                      left={left}
                      width={width}
                      isSprint={isSprint}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center text-muted-foreground py-12 text-sm">
            Aucun projet en cours
          </div>
        )}
      </div>
    </div>
  );
}
