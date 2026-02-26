import { create } from "zustand";

export type ZoomLevel = "month" | "week" | "day";

interface GanttState {
  filterMemberId: string;
  filterProjectId: string;
  groupBy: "none" | "member" | "project";
  zoom: ZoomLevel;
  setFilterMemberId: (id: string) => void;
  setFilterProjectId: (id: string) => void;
  setGroupBy: (groupBy: "none" | "member" | "project") => void;
  setZoom: (zoom: ZoomLevel) => void;
  resetFilters: () => void;
}

export const useGanttStore = create<GanttState>((set) => ({
  filterMemberId: "",
  filterProjectId: "",
  groupBy: "none",
  zoom: "week",
  setFilterMemberId: (id) => set({ filterMemberId: id }),
  setFilterProjectId: (id) => set({ filterProjectId: id }),
  setGroupBy: (groupBy) => set({ groupBy }),
  setZoom: (zoom) => set({ zoom }),
  resetFilters: () =>
    set({ filterMemberId: "", filterProjectId: "", groupBy: "none" }),
}));
