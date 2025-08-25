import { ListSelect } from "@/types";
import { create } from "zustand";

interface ListState {
  activeList: ListSelect | null;
  setActiveList: (List: ListSelect) => void;
  mergeActiveList: (patch: Partial<ListSelect>) => void;
}

export const useKanbanStore = create<ListState>()((set) => ({
  activeList: null,
  setActiveList: (List) => set(() => ({ activeList: List })),
  mergeActiveList: (patch) => set((s) => (s.activeList ? { activeList: { ...s.activeList, ...patch } } : s)),
}));
