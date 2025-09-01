// TODO: Task 5.3 - Set up client-side state management with Zustand

/*
TODO: Implementation Notes for Interns:

UI state management store for:
- Modal states (create project, create task, etc.)
- Sidebar state
- Theme preferences
- Loading states
- Error states
- Notifications/toasts

Install: pnpm add zustand

Example structure:
import { create } from 'zustand'

interface UIState {
  // Modal states
  isCreateProjectModalOpen: boolean
  isCreateTaskModalOpen: boolean
  isTaskDetailModalOpen: boolean
  selectedTaskId: string | null

  // UI states
  sidebarOpen: boolean
  theme: 'light' | 'dark'

  // Loading states
  isLoading: boolean
  loadingMessage: string

  // Actions
  openCreateProjectModal: () => void
  closeCreateProjectModal: () => void
  openCreateTaskModal: () => void
  closeCreateTaskModal: () => void
  openTaskDetailModal: (taskId: string) => void
  closeTaskDetailModal: () => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLoading: (loading: boolean, message?: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  // ... implementation
}))
*/

import { create } from "zustand";

interface UIState {
  // Modal states
  isTaskDetailsModalOpen: boolean;
  setTaskDetailsModalOpen: (val: boolean) => void;

  isUpdateKanbanModalOpen: boolean;
  setUpdateKanbanModalOpen: (val: boolean) => void;

  isDeleteKanbanModalOpen: boolean;
  setDeleteKanbanModalOpen: (val: boolean) => void;

  isCreateTaskModalOpen: boolean;
  setCreateTaskModalOpen: (val: boolean) => void;

  isCreateProjectModalOpen: boolean;
  setCreateProjectModalOpen: (val: boolean) => void;

  isDeleteProjectModalOpen: boolean;
  setDeleteProjectModalOpen: (val: boolean) => void;

  isCreateLabelModalOpen: boolean;
  setCreateLabelModalOpen: (val: boolean) => void;

  isDeleteLabelModalOpen: boolean;
  setDeleteLabelModalOpen: (val: boolean) => void;

  isUpdateLabelModalOpen: boolean;
  setUpdateLabelModalOpen: (val: boolean) => void;

  isCreateTeamModalOpen: boolean;
  setCreateTeamModalOpen: (val: boolean) => void;

  isDeleteTeamModalOpen: boolean;
  setDeleteTeamModalOpen: (val: boolean) => void;

  isAddMemberModalOpen: boolean;
  setAddMemberModalOpen: (val: boolean) => void;

  isReassignLeaderModalOpen: boolean;
  setReassignLeaderModalOpen: (val: boolean) => void;

  isReassignManagerModalOpen: boolean;
  setReassignManagerModalOpen: (val: boolean) => void;

  isSideBarOpen: boolean;
  setSideBarOpen: (val: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isTaskDetailsModalOpen: false,
  setTaskDetailsModalOpen: (val) => set(() => ({ isTaskDetailsModalOpen: val })),

  isUpdateKanbanModalOpen: false,
  setUpdateKanbanModalOpen: (val) => set(() => ({ isUpdateKanbanModalOpen: val })),

  isDeleteKanbanModalOpen: false,
  setDeleteKanbanModalOpen: (val) => set(() => ({ isDeleteKanbanModalOpen: val })),

  isCreateTaskModalOpen: false,
  setCreateTaskModalOpen: (val) => set(() => ({ isCreateTaskModalOpen: val })),

  isCreateProjectModalOpen: false,
  setCreateProjectModalOpen: (val) => set(() => ({ isCreateProjectModalOpen: val })),

  isDeleteProjectModalOpen: false,
  setDeleteProjectModalOpen: (val) => set(() => ({ isDeleteProjectModalOpen: val })),

  isCreateLabelModalOpen: false,
  setCreateLabelModalOpen: (val) => set(() => ({ isCreateLabelModalOpen: val })),

  isDeleteLabelModalOpen: false,
  setDeleteLabelModalOpen: (val) => set(() => ({ isDeleteLabelModalOpen: val })),

  isUpdateLabelModalOpen: false,
  setUpdateLabelModalOpen: (val) => set(() => ({ isUpdateLabelModalOpen: val })),

  isCreateTeamModalOpen: false,
  setCreateTeamModalOpen: (val) => set(() => ({ isCreateTeamModalOpen: val })),

  isDeleteTeamModalOpen: false,
  setDeleteTeamModalOpen: (val) => set(() => ({ isDeleteTeamModalOpen: val })),

  isAddMemberModalOpen: false,
  setAddMemberModalOpen: (val) => set(() => ({ isAddMemberModalOpen: val })),

  isReassignLeaderModalOpen: false,
  setReassignLeaderModalOpen: (val) => set(() => ({ isReassignLeaderModalOpen: val })),

  isReassignManagerModalOpen: false,
  setReassignManagerModalOpen: (val) => set(() => ({ isReassignManagerModalOpen: val })),

  isSideBarOpen: false,
  setSideBarOpen: (val) => set(() => ({ isSideBarOpen: val })),
}));
