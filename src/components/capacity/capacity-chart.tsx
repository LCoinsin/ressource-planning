"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line,
} from "recharts";
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  isWeekend,
} from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo } from "react";
import type { ZoomLevel } from "@/store/gantt-store";

interface CapacityData {
  tasks: {
    dateDebut: string;
    dateFin: string;
    load: number;
    members: { id: string }[];
  }[];
  members: {
    id: string;
    dateArrivee: string;
    dateDepart: string | null;
    isResource?: boolean;
  }[];
  start: Date;
  end: Date;
  zoom: ZoomLevel;
  minWidth: number;
}

interface DataPoint {
  label: string;
  fullLabel: string;
  capacite: number;
  charge: number;
}

export function CapacityChart({
  tasks,
  members,
  start,
  end,
  zoom,
  minWidth,
}: CapacityData) {
  const data = useMemo((): DataPoint[] => {
    if (zoom === "day") {
      return eachDayOfInterval({ start, end })
        .filter((day) => !isWeekend(day))
        .map((day) => computePoint(day, day, members, tasks, "dd/MM", "dd MMM yyyy"));
    }

    if (zoom === "week") {
      const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
      return weeks.map((weekStart) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return computePoint(
          weekStart,
          weekEnd,
          members,
          tasks,
          "'S'ww",
          "'Semaine' ww - MMM yyyy"
        );
      });
    }

    // month
    const months = eachMonthOfInterval({ start, end });
    return months.map((monthStart) => {
      const monthEnd = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0
      );
      return computePoint(
        monthStart,
        monthEnd,
        members,
        tasks,
        "MMM yy",
        "MMMM yyyy"
      );
    });
  }, [tasks, members, start, end, zoom]);

  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12 text-sm">
        Pas assez de donnees pour afficher le graphique
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.capacite, d.charge)),
    1
  );

  return (
    <div style={{ minWidth: Math.max(minWidth, 800) }}>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="overloadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#EF4444" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.3}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
            stroke="var(--border)"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            stroke="var(--border)"
            domain={[0, Math.ceil(maxValue * 1.2)]}
            label={{
              value: "ETP",
              angle: -90,
              position: "insideLeft",
              fontSize: 10,
              fill: "var(--muted-foreground)",
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as DataPoint;
              const isOverload = d.charge > d.capacite;
              return (
                <div className="bg-background border border-border/50 rounded-xl p-3 shadow-lg text-xs">
                  <p className="font-semibold mb-1.5 capitalize">
                    {d.fullLabel}
                  </p>
                  <p className="text-blue-500">Capacite : {d.capacite} ETP</p>
                  <p
                    className={
                      isOverload
                        ? "text-red-500 font-semibold"
                        : "text-emerald-500"
                    }
                  >
                    Charge : {d.charge} ETP
                    {isOverload && " (Surcharge)"}
                  </p>
                </div>
              );
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="charge"
            fill="url(#overloadGrad)"
            stroke="transparent"
            name=" "
            legendType="none"
          />
          <Line
            type="stepAfter"
            dataKey="capacite"
            name="Capacite"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            strokeDasharray="6 3"
          />
          <Line
            type="monotone"
            dataKey="charge"
            name="Charge"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function computePoint(
  periodStart: Date,
  periodEnd: Date,
  members: { id: string; dateArrivee: string; dateDepart: string | null; isResource?: boolean }[],
  tasks: { dateDebut: string; dateFin: string; load: number; members: { id: string }[] }[],
  labelFmt: string,
  fullLabelFmt: string
): DataPoint {
  const midpoint = new Date(
    (periodStart.getTime() + periodEnd.getTime()) / 2
  );
  const dayTime = midpoint.getTime();

  // Exclude non-resource members (admins) from capacity calculation
  const capacite = members.filter((m) => {
    if (m.isResource === false) return false;
    const arrive = new Date(m.dateArrivee).getTime();
    const depart = m.dateDepart ? new Date(m.dateDepart).getTime() : Infinity;
    return dayTime >= arrive && dayTime <= depart;
  }).length;

  const charge = tasks.reduce((sum, t) => {
    const tStart = new Date(t.dateDebut).getTime();
    const tEnd = new Date(t.dateFin).getTime();
    if (dayTime >= tStart && dayTime <= tEnd) {
      return sum + t.load;
    }
    return sum;
  }, 0);

  return {
    label: format(periodStart, labelFmt, { locale: fr }),
    fullLabel: format(periodStart, fullLabelFmt, { locale: fr }),
    capacite,
    charge: Math.round(charge * 100) / 100,
  };
}
