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

  isReassignProjectTeamsModalOpen: boolean;
  setReassignProjectTeamsModalOpen: (val: boolean) => void;

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

  isReassignProjectTeamsModalOpen: false,
  setReassignProjectTeamsModalOpen: (val) => set(() => ({ isReassignProjectTeamsModalOpen: val })),

  isSideBarOpen: false,
  setSideBarOpen: (val) => set(() => ({ isSideBarOpen: val })),
}));
