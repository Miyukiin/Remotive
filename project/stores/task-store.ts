import { TaskSelect } from "@/types";
import { create } from "zustand";

interface TaskState {
  activeTask: TaskSelect | null;
  setActiveTask: (task: TaskSelect) => void;
  mergeActiveTask: (patch: Partial<TaskSelect>) => void;

  isEditingTaskName: boolean;
  setisEditingTaskName: (val: boolean) => void;
}

export const useTaskStore = create<TaskState>()((set) => ({
  activeTask: null,
  setActiveTask: (task) => set(() => ({ activeTask: task })),
  mergeActiveTask: (patch) =>
    set((s) => (s.activeTask ? { activeTask: { ...s.activeTask, ...patch } } : s)),

  isEditingTaskName: false,
  setisEditingTaskName(val) {
    set(() => ({ isEditingTaskName: val }));
  },
}));
