import { LabelSelect } from "@/types";
import { create } from "zustand";

interface LabelState {
  labelToDelete: LabelSelect | null;
  setLabelToDelete: (task: LabelSelect) => void;
}

export const useLabelStore = create<LabelState>()((set) => ({
  labelToDelete: null,
  setLabelToDelete: (label) => set(() => ({ labelToDelete: label })),
}));
