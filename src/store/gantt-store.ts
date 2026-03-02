import { create } from "zustand";

export type ZoomLevel = "month" | "week" | "day";
export type GanttViewMode = "detail" | "macro";

interface GanttState {
  filterMemberId: string;
  filterProjectId: string;
  groupBy: "none" | "member" | "project";
  zoom: ZoomLevel;
  viewMode: GanttViewMode;
  showLoad: boolean;
  collapsedSprintIds: Set<string>;
  setFilterMemberId: (id: string) => void;
  setFilterProjectId: (id: string) => void;
  setGroupBy: (groupBy: "none" | "member" | "project") => void;
  setZoom: (zoom: ZoomLevel) => void;
  setViewMode: (mode: GanttViewMode) => void;
  setShowLoad: (show: boolean) => void;
  toggleSprintCollapsed: (sprintId: string) => void;
  resetFilters: () => void;
}

export const useGanttStore = create<GanttState>((set) => ({
  filterMemberId: "",
  filterProjectId: "",
  groupBy: "none",
  zoom: "week",
  viewMode: "detail",
  showLoad: true,
  collapsedSprintIds: new Set<string>(),
  setFilterMemberId: (id) => set({ filterMemberId: id }),
  setFilterProjectId: (id) => set({ filterProjectId: id }),
  setGroupBy: (groupBy) => set({ groupBy }),
  setZoom: (zoom) => set({ zoom }),
  setViewMode: (viewMode) => set({ viewMode }),
  setShowLoad: (showLoad) => set({ showLoad }),
  toggleSprintCollapsed: (sprintId) =>
    set((state) => {
      const next = new Set(state.collapsedSprintIds);
      if (next.has(sprintId)) {
        next.delete(sprintId);
      } else {
        next.add(sprintId);
      }
      return { collapsedSprintIds: next };
    }),
  resetFilters: () =>
    set({ filterMemberId: "", filterProjectId: "", groupBy: "none" }),
}));
