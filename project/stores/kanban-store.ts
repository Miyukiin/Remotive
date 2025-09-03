import { ListSelect } from "@/types";
import { create } from "zustand";

interface ListState {
  activeList: ListSelect | null;
  setActiveList: (List: ListSelect) => void;
  mergeActiveList: (patch: Partial<ListSelect>) => void;

  listToDelete: ListSelect | null;
  setListToDelete: (task: ListSelect) => void;

  lists: ListSelect[] | null; // Active Kanban Lists
  setLists: (Lists: ListSelect[]) => void; // Active Kanban Lists Setter
}

export const useKanbanStore = create<ListState>()((set) => ({
  activeList: null,
  setActiveList: (List) => set(() => ({ activeList: List })),
  mergeActiveList: (patch) => set((s) => (s.activeList ? { activeList: { ...s.activeList, ...patch } } : s)),

  listToDelete: null,
  setListToDelete: (list) => set(() => ({ listToDelete: list })),

  lists: null,
  setLists: (Lists) => set(() => ({ lists: Lists })),
}));
