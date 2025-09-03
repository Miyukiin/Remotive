import {
  createCommentAction,
  deleteCommentAction,
  getTaskComments,
  updateCommentAction,
} from "@/actions/comment-actions";
import { getTempId } from "@/lib/utils";
import { commentSchemaForm } from "@/lib/validations/validations";
import { CommentSelect } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

export function useComments(task_id: number) {
  const queryClient = useQueryClient();

  // Get comments per task
  const getCommentsByTask = useQuery({
    queryKey: ["comments", task_id],
    enabled: typeof task_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, project_id] = queryKey as ["comments", number];
      const res = await getTaskComments(project_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  // Create comment
  const createComment = useMutation({
    mutationFn: async ({
      author_id,
      task_id,
      parent_comment_id,
      commentFormData,
    }: {
      author_id: number;
      task_id: number;
      parent_comment_id?: number;
      commentFormData: z.infer<typeof commentSchemaForm>;
    }) => {
      const res = await createCommentAction(author_id, task_id, commentFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ author_id, task_id, parent_comment_id, commentFormData }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", task_id] });

      const previousTaskComments = queryClient.getQueryData<CommentSelect[]>(["comments", task_id]);

      const tempId = getTempId();
      const now = new Date();

      // Create optimistic comment
      const optimisticComment: CommentSelect = {
        id: tempId,
        content: commentFormData.content,
        taskId: task_id,
        createdAt: now,
        updatedAt: now,
        authorId: author_id,
        parentCommentId: parent_comment_id ? parent_comment_id : null, // If thread, parent_comment_id must be defined.
      };

      // Optimistically update the existing cache
      queryClient.setQueryData<CommentSelect[]>(["comments", task_id], (old) =>
        old ? [...old, optimisticComment] : old,
      );

      return { previousTaskComments, tempId, task_id };
    },
    onSuccess: (createdComment, variables, context) => {
      toast.success("Success", { description: "Successfully created the comment." });

      // Replace Optimistic UI data with Server data.
      queryClient.setQueryData<CommentSelect[]>(
        ["comments", variables.task_id],
        (old) => old?.map((c) => (c.id === context!.tempId ? createdComment : c)) ?? old,
      );
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });

      // Rollback
      queryClient.setQueryData(["comments", task_id], context?.previousTaskComments);
    },
    onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: ["comments", context?.task_id] });
    },
  });

  // Delete comment
  const deleteComment = useMutation({
    mutationFn: async ({ task_id, comment_id }: { task_id: number; comment_id: number }) => {
      const res = await deleteCommentAction(task_id, comment_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ task_id, comment_id }: { task_id: number; comment_id: number }) => {
      queryClient.cancelQueries({ queryKey: ["comments", comment_id] });

      const previousComments = queryClient.getQueryData<CommentSelect[]>(["comments", comment_id]);

      queryClient.setQueryData<CommentSelect[]>(["comments", comment_id], (old) =>
        old ? old.filter((c) => c.id != comment_id) : old,
      );

      return { previousComments, task_id };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully deleted the comment." });
    },
    onError: (error, data, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["comments", context?.task_id], context?.previousComments);
    },
    onSettled: (data, error, context) => {
      queryClient.invalidateQueries({ queryKey: ["comments", context?.task_id] });
    },
  });

  // update comment
  const updateComment = useMutation({
    mutationFn: async ({
      task_id,
      comment_id,
      commentFormData,
    }: {
      task_id: number;
      comment_id: number;
      commentFormData: z.infer<typeof commentSchemaForm>;
    }) => {
      const res = await updateCommentAction(task_id, comment_id, commentFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({
      task_id,
      comment_id,
      commentFormData,
    }: {
      task_id: number;
      comment_id: number;
      commentFormData: z.infer<typeof commentSchemaForm>;
    }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", task_id] });

      const previousComments = queryClient.getQueryData<CommentSelect[]>(["comments", task_id]);

      queryClient.setQueryData<CommentSelect[]>(["comments", task_id], (old) =>
        old ? old.map((c) => (c.id != comment_id ? { ...c, commentFormData } : c)) : old,
      );

      return { previousComments, task_id };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully updated the comment." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["comments", variables.task_id], context?.previousComments);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.task_id] });
    },
  });

  return {
    // Fetches
    taskComments: getCommentsByTask.data,
    taskCommentsIsLoading: getCommentsByTask.isLoading,
    taskCommentsError: getCommentsByTask.isError,

    // Mutations
    createComment: createComment.mutate,
    isCommentCreationLoading: createComment.isPending,
    commentCreationError: createComment.error,

    deleteComment: deleteComment.mutate,
    isCommentDeletionLoading: deleteComment.isPending,
    commentDeletionError: deleteComment.error,

    updateComment: updateComment.mutate,
    isCommentUpdateLoading: updateComment.isPending,
    commentUpdateError: updateComment.error,
  };
}
