import { create } from "zustand";

export type ZoomLevel = "month" | "week" | "day";
export type GanttViewMode = "detail" | "macro";

interface GanttState {
  filterMemberId: string;
  filterProjectId: string;
  groupBy: "none" | "member" | "project";
  zoom: ZoomLevel;
  viewMode: GanttViewMode;
  setFilterMemberId: (id: string) => void;
  setFilterProjectId: (id: string) => void;
  setGroupBy: (groupBy: "none" | "member" | "project") => void;
  setZoom: (zoom: ZoomLevel) => void;
  setViewMode: (mode: GanttViewMode) => void;
  resetFilters: () => void;
}

export const useGanttStore = create<GanttState>((set) => ({
  filterMemberId: "",
  filterProjectId: "",
  groupBy: "none",
  zoom: "week",
  viewMode: "detail",
  setFilterMemberId: (id) => set({ filterMemberId: id }),
  setFilterProjectId: (id) => set({ filterProjectId: id }),
  setGroupBy: (groupBy) => set({ groupBy }),
  setZoom: (zoom) => set({ zoom }),
  setViewMode: (viewMode) => set({ viewMode }),
  resetFilters: () =>
    set({ filterMemberId: "", filterProjectId: "", groupBy: "none" }),
}));
