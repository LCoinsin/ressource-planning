"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGanttStore, type ZoomLevel, type GanttViewMode } from "@/store/gantt-store";
import { RotateCcw, Calendar, CalendarDays, CalendarRange, Layers, FolderKanban, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

type Member = { id: string; nom: string; prenom: string };
type Project = { id: string; nom: string };

const ZOOM_OPTIONS: { value: ZoomLevel; label: string; icon: typeof Calendar }[] = [
  { value: "month", label: "Mois", icon: CalendarRange },
  { value: "week", label: "Semaine", icon: CalendarDays },
  { value: "day", label: "Jour", icon: Calendar },
];

const VIEW_OPTIONS: { value: GanttViewMode; label: string; icon: typeof Layers }[] = [
  { value: "detail", label: "Detaillee", icon: Layers },
  { value: "macro", label: "Macro", icon: FolderKanban },
];

export function GanttToolbar({
  members,
  projects,
}: {
  members: Member[];
  projects: Project[];
}) {
  const {
    filterMemberId,
    filterProjectId,
    groupBy,
    zoom,
    viewMode,
    showLoad,
    setFilterMemberId,
    setFilterProjectId,
    setGroupBy,
    setZoom,
    setViewMode,
    setShowLoad,
    resetFilters,
  } = useGanttStore();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* View mode toggle */}
      <div className="flex items-center rounded-xl border border-border/50 bg-muted/30 p-0.5">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setViewMode(opt.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              viewMode === opt.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <opt.icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-border/50" />

      {/* Zoom control */}
      <div className="flex items-center rounded-xl border border-border/50 bg-muted/30 p-0.5">
        {ZOOM_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setZoom(opt.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              zoom === opt.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <opt.icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filters — only visible in detail view */}
      {viewMode === "detail" && (
        <>
          <div className="h-5 w-px bg-border/50" />

          <Select
            value={filterMemberId || "all"}
            onValueChange={(v) => setFilterMemberId(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[170px] rounded-xl border-border/50 bg-background h-8 text-xs">
              <SelectValue placeholder="Tous les membres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les membres</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.prenom} {m.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterProjectId || "all"}
            onValueChange={(v) => setFilterProjectId(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[170px] rounded-xl border-border/50 bg-background h-8 text-xs">
              <SelectValue placeholder="Tous les projets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les projets</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={groupBy}
            onValueChange={(v) =>
              setGroupBy(v as "none" | "member" | "project")
            }
          >
            <SelectTrigger className="w-[170px] rounded-xl border-border/50 bg-background h-8 text-xs">
              <SelectValue placeholder="Grouper par..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sans regroupement</SelectItem>
              <SelectItem value="member">Par membre</SelectItem>
              <SelectItem value="project">Par projet</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={() => setShowLoad(!showLoad)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all border",
              showLoad
                ? "bg-background text-foreground border-border/50 shadow-sm"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
            title={showLoad ? "Masquer la charge" : "Afficher la charge"}
          >
            <Percent className="h-3.5 w-3.5" />
            Charge
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl"
            onClick={resetFilters}
            title="Reinitialiser les filtres"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  );
}
