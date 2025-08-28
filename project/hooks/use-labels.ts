import {
  createLabelAction,
  deleteLabelAction,
  getProjectLabelsAction,
  getTaskLabelsAction,
  updateLabelAction,
  updateTaskLabelsAction,
} from "@/actions/labels-actions";
import { getTempId } from "@/lib/utils";
import { labelSchemaForm } from "@/lib/validations/validations";
import { LabelSelect, LabelUpdateForm } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

export function useLabels({ project_id, task_id }: { project_id: number; task_id?: number }) {
  const queryClient = useQueryClient();

  const getLabelsByProject = useQuery({
    queryKey: ["labels", project_id],
    enabled: typeof project_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, project_id] = queryKey as ["labels", number];
      const res = await getProjectLabelsAction(project_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const getLabelsByTask = useQuery({
    queryKey: ["labels", task_id],
    enabled: typeof task_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, task_id] = queryKey as ["labels", number];
      const res = await getTaskLabelsAction(task_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const createLabel = useMutation({
    mutationFn: async ({
      project_id,
      labelFormData,
    }: {
      project_id: number;
      labelFormData: z.infer<typeof labelSchemaForm>;
    }) => {
      const res = await createLabelAction(project_id, labelFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ project_id, labelFormData }) => {
      await queryClient.cancelQueries({ queryKey: ["labels", project_id] });

      const previousLabels = queryClient.getQueryData<LabelSelect[]>(["labels", project_id]);

      const tempId = getTempId();

      // create an optimistic label
      const optimisticLabel: LabelSelect = {
        id: tempId,
        ...labelFormData,
        project_id,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Tanstack Optimistic UI
      queryClient.setQueryData<LabelSelect[]>(["labels", project_id], (old) => (old ? [...old, optimisticLabel] : old));

      return { previousLabels, tempId, project_id };
    },
    onSuccess: (createdLabel, variables, context) => {
      toast.success("Success", { description: "Successfully created the label." });

      // We replace optimistic label with the tempId with the server-sourced task with actual id
      queryClient.setQueryData<LabelSelect[]>(
        ["labels", variables.project_id],
        (old) => old?.map((l) => (l.id === context!.tempId ? createdLabel : l)) ?? old,
      );
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });

      // Rollback
      queryClient.setQueryData(["labels", project_id], context?.previousLabels);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["labels", project_id] });
    },
  });

  const deleteLabel = useMutation({
    mutationFn: async (label_id: number) => {
      const res = await deleteLabelAction(label_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async (label_id: number) => {
      queryClient.cancelQueries({ queryKey: ["labels", project_id] });

      const previousLabels = queryClient.getQueryData<LabelSelect[]>(["labels", project_id]);

      queryClient.setQueryData<LabelSelect[]>(["labels", project_id], (old) =>
        old ? old.filter((l) => l.id != label_id) : old,
      );

      return { previousLabels };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully deleted the label." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["labels", project_id], context?.previousLabels);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["labels", project_id] });
    },
  });

  const updateLabel = useMutation({
    mutationFn: async ({
      project_id,
      label_id,
      labelFormData,
    }: {
      project_id: number;
      label_id: number;
      labelFormData: LabelUpdateForm;
    }) => {
      const res = await updateLabelAction(project_id, label_id, labelFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ project_id, labelFormData }) => {
      await queryClient.cancelQueries({ queryKey: ["labels", project_id] });

      const previousLabels = queryClient.getQueryData<LabelSelect[]>(["labels", project_id]);

      // Optimistically update the label with the inputted labelFormData
      queryClient.setQueryData<LabelSelect[]>(["labels", project_id], (old) =>
        old
          ? old.map((l) =>
              l.id === project_id
                ? {
                    ...l,
                    ...labelFormData,
                  }
                : l,
            )
          : old,
      );

      return { previousLabels };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully updated the label." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      // Rollback
      queryClient.setQueryData(["labels", project_id], context?.previousLabels);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["labels", project_id] });
    },
  });

  const updateTaskLabels = useMutation({
    mutationFn: async ({ task_id, incomingLabels }: { task_id: number; incomingLabels: LabelSelect[] }) => {
      const res = await updateTaskLabelsAction(task_id, incomingLabels);

      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ task_id, incomingLabels }) => {
      await queryClient.cancelQueries({ queryKey: ["labels", task_id] });

      const previousTaskLabels = queryClient.getQueryData<LabelSelect[]>(["labels", task_id]);

      // Optimistically update the task's labels.
      queryClient.setQueryData<LabelSelect[]>(["labels", task_id], () => incomingLabels);

      return { previousTaskLabels, task_id };
    },
    onSuccess: () => {
      // toast.success("Success", { description: "Successfully updated the task labels." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      // Rollback
      queryClient.setQueryData(["labels", context?.task_id], context?.previousTaskLabels);
    },
    onSettled: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["labels", context?.task_id] });
    },
  });

  return {
    // Get Project Labels
    projectLabels: getLabelsByProject.data,
    isProjectLabelsLoading: getLabelsByProject.isLoading,
    projectLabelsError: getLabelsByProject.error,

    // Get Task Labels
    taskLabels: getLabelsByTask.data,
    isTaskLabelsLoading: getLabelsByTask.isLoading,
    taskLabelsError: getLabelsByTask.error,

    // Mutations
    createLabel: createLabel.mutateAsync,
    isLabelCreationLoading: createLabel.isPending,
    labelCreationError: createLabel.error,

    deleteLabel: deleteLabel.mutateAsync,
    isLabelDeletionLoading: deleteLabel.isPending,
    labelDeletionError: deleteLabel.error,

    updateLabel: updateLabel.mutateAsync,
    isLabelUpdateLoading: updateLabel.isPending,
    labelUpdateError: updateLabel.error,

    updateTaskLabels: updateTaskLabels.mutateAsync,
    isTaskLabelsUpdating: updateTaskLabels.isPending,
    updateTaskLabelsError: updateTaskLabels.error,
  };
}
