"use client";

import {
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isToday,
  isMonday,
  getISOWeek,
  isSameMonth,
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { ZoomLevel } from "@/store/gantt-store";

interface GanttHeaderProps {
  start: Date;
  end: Date;
  zoom: ZoomLevel;
}

export function GanttHeader({ start, end, zoom }: GanttHeaderProps) {
  if (zoom === "day") return <DayHeader start={start} end={end} />;
  if (zoom === "week") return <WeekHeader start={start} end={end} />;
  return <MonthHeader start={start} end={end} />;
}

function DayHeader({ start, end }: { start: Date; end: Date }) {
  const days = eachDayOfInterval({ start, end });
  const totalDays = days.length;

  // Group days by month
  const months: { label: string; span: number }[] = [];
  let currentMonth = "";
  for (const day of days) {
    const monthLabel = format(day, "MMMM yyyy", { locale: fr });
    if (monthLabel !== currentMonth) {
      months.push({ label: monthLabel, span: 1 });
      currentMonth = monthLabel;
    } else {
      months[months.length - 1].span++;
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40">
      <div className="flex h-7 border-b border-border/30">
        {months.map((m, i) => (
          <div
            key={i}
            className="text-[11px] font-semibold text-center text-muted-foreground border-r border-border/20 truncate capitalize px-1 flex items-center justify-center"
            style={{ width: `${(m.span / totalDays) * 100}%` }}
          >
            {m.label}
          </div>
        ))}
      </div>
      <div className="flex h-6">
        {days.map((day, i) => (
          <div
            key={i}
            className={cn(
              "text-[10px] text-center border-r border-border/20 flex-shrink-0 flex items-center justify-center",
              isToday(day) && "bg-primary/10 font-bold text-primary",
              isMonday(day) && "font-semibold",
              day.getDay() === 0 || day.getDay() === 6
                ? "text-muted-foreground/50 bg-muted/20"
                : "text-muted-foreground"
            )}
            style={{ width: `${100 / totalDays}%` }}
          >
            {format(day, "dd")}
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekHeader({ start, end }: { start: Date; end: Date }) {
  const days = eachDayOfInterval({ start, end });
  const totalDays = days.length;
  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });

  // Group weeks by month
  const months: { label: string; span: number }[] = [];
  let currentMonth = "";
  for (const week of weeks) {
    const monthLabel = format(week, "MMMM yyyy", { locale: fr });
    if (monthLabel !== currentMonth) {
      months.push({ label: monthLabel, span: 1 });
      currentMonth = monthLabel;
    } else {
      months[months.length - 1].span++;
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40">
      <div className="flex h-7 border-b border-border/30">
        {months.map((m, i) => (
          <div
            key={i}
            className="text-[11px] font-semibold text-center text-muted-foreground border-r border-border/20 truncate capitalize px-1 flex items-center justify-center"
            style={{ width: `${(m.span / weeks.length) * 100}%` }}
          >
            {m.label}
          </div>
        ))}
      </div>
      <div className="flex h-6">
        {weeks.map((week, i) => {
          const weekNum = getISOWeek(week);
          const hasToday = days.some(
            (d) => isToday(d) && getISOWeek(d) === weekNum && isSameMonth(d, week)
          );
          return (
            <div
              key={i}
              className={cn(
                "text-[10px] text-center border-r border-border/20 flex-shrink-0 flex items-center justify-center text-muted-foreground",
                hasToday && "bg-primary/10 font-bold text-primary"
              )}
              style={{ width: `${100 / weeks.length}%` }}
            >
              S{weekNum.toString().padStart(2, "0")}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthHeader({ start, end }: { start: Date; end: Date }) {
  const months = eachMonthOfInterval({ start, end });

  // Group by year
  const years: { label: string; span: number }[] = [];
  let currentYear = "";
  for (const month of months) {
    const yearLabel = format(month, "yyyy");
    if (yearLabel !== currentYear) {
      years.push({ label: yearLabel, span: 1 });
      currentYear = yearLabel;
    } else {
      years[years.length - 1].span++;
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40">
      <div className="flex h-7 border-b border-border/30">
        {years.map((y, i) => (
          <div
            key={i}
            className="text-[11px] font-semibold text-center text-muted-foreground border-r border-border/20 truncate px-1 flex items-center justify-center"
            style={{ width: `${(y.span / months.length) * 100}%` }}
          >
            {y.label}
          </div>
        ))}
      </div>
      <div className="flex h-6">
        {months.map((month, i) => {
          const now = new Date();
          const isCurrent =
            month.getMonth() === now.getMonth() &&
            month.getFullYear() === now.getFullYear();
          return (
            <div
              key={i}
              className={cn(
                "text-[10px] text-center border-r border-border/20 flex-shrink-0 flex items-center justify-center capitalize text-muted-foreground",
                isCurrent && "bg-primary/10 font-bold text-primary"
              )}
              style={{ width: `${100 / months.length}%` }}
            >
              {format(month, "MMM", { locale: fr })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
