import { create } from "zustand";
import type { PendingProjectManager} from "@/types";

type ProjectManagerState = {
  pendingProjectManager: PendingProjectManager;
  setPendingProjectManager: (p: PendingProjectManager) => void;
};

export const useProjectManagerStore = create<ProjectManagerState>((set) => ({
  pendingProjectManager: null,
  setPendingProjectManager: (p) => set({ pendingProjectManager: p }),
}));
