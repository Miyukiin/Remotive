// TODO: Task 4.4 - Build task creation and editing functionality
// TODO: Task 5.4 - Implement optimistic UI updates for smooth interactions

/*
TODO: Implementation Notes for Interns:

Custom hook for task data management:
- Fetch tasks for a project
- Create new task
- Update task
- Delete task
- Move task between lists
- Bulk operations

Features:
- Optimistic updates for smooth UX
- Real-time synchronization
- Conflict resolution
- Undo functionality
- Batch operations

Example structure:
export function useTasks(projectId: string) {
  const queryClient = useQueryClient()
  
  const {
    data: tasks,
    isLoading,
    error
  } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => queries.tasks.getByProject(projectId),
    enabled: !!projectId
  })
  
  const createTask = useMutation({
    mutationFn: queries.tasks.create,
    onMutate: async (newTask) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] })
      const previousTasks = queryClient.getQueryData(['tasks', projectId])
      queryClient.setQueryData(['tasks', projectId], (old: Task[]) => [...old, { ...newTask, id: 'temp-' + Date.now() }])
      return { previousTasks }
    },
    onError: (err, newTask, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks', projectId], context?.previousTasks)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    }
  })
  
  return {
    tasks,
    isLoading,
    error,
    createTask: createTask.mutate,
    isCreating: createTask.isPending
  }
}
*/

// Placeholder to prevent import errors

"use client";
import {
  createTaskAction,
  deleteTaskAction,
  getTaskByIdAction,
  getTaskMembersAction,
  getTasksByListIdAction,
  getTasksByProjectAction,
  getTaskStatusAction,
  updateTaskAction,
  updateTaskNewAction,
  updateTasksPositionsAction,
} from "@/actions/task-actions";
import { getUserId } from "@/actions/user-actions";
import { getTempId } from "@/lib/utils";
import { taskSchemaEditForm, taskSchemaForm } from "@/lib/validations/validations";
import { useTaskStore } from "@/stores/task-store";
import { TaskPositionPayload, TaskSelect, UserSelect } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

export function useTasks({
  project_id,
  list_id,
  task_id,
}: {
  project_id?: number;
  list_id?: number;
  task_id?: number;
}) {
  const queryClient = useQueryClient();
  const { mergeActiveTask, setActiveTask } = useTaskStore.getState();

  const getTaskByProject = useQuery({
    queryKey: ["tasks", project_id],
    enabled: typeof project_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, project_id] = queryKey as ["tasks", number];
      const res = await getTasksByProjectAction(project_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const getTaskByListId = useQuery({
    queryKey: ["tasks", list_id],
    enabled: typeof list_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, list_id] = queryKey as ["tasks", number];
      const res = await getTasksByListIdAction(list_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const getTaskById = useQuery({
    queryKey: ["task", task_id],
    enabled: typeof task_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, project_id] = queryKey as ["task", number];
      const res = await getTaskByIdAction(project_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const getTaskMembers = useQuery({
    queryKey: ["task_members", task_id],
    enabled: typeof task_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, task_id] = queryKey as ["tasks_members", number];
      const res = await getTaskMembersAction(task_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const getTaskStatus = useQuery({
    queryKey: ["task_status", task_id],
    enabled: typeof task_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, task_id] = queryKey as ["tasks_members", number];
      const res = await getTaskStatusAction(task_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const createTask = useMutation({
    mutationFn: async ({
      list_id,
      project_id,
      position,
      taskFormData,
    }: {
      list_id: number;
      project_id: number;
      position: number;
      taskFormData: z.infer<typeof taskSchemaForm>;
    }) => {
      const res = await createTaskAction(list_id, position, taskFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ list_id, project_id, position, taskFormData }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", list_id] });
      await queryClient.cancelQueries({ queryKey: ["tasks", project_id] });

      const previousListTasks = queryClient.getQueryData<TaskSelect[]>(["tasks", list_id]);
      const previousProjectTasks = queryClient.getQueryData<TaskSelect[]>(["tasks", project_id]);

      const tempId = getTempId();
      const res = await getUserId();
      if(!res.success) throw new Error(res.message)

      // Build an optimistic task
      const now = new Date();

      // Same as server action createTask
      const optimisticTask: TaskSelect = {
        id: tempId,
        title: taskFormData.title,
        description: taskFormData.description,
        content: taskFormData.content,
        creatorId: res.data.id,
        listId: list_id,
        priority: taskFormData.priority,
        dueDate: taskFormData.dueDate,
        position: position,
        createdAt: now,
        updatedAt: now,
      };

      // Tanstack Optimistic UI
      queryClient.setQueryData<TaskSelect[]>(["tasks", list_id], (old) => (old ? [...old, optimisticTask] : old));
      queryClient.setQueryData<TaskSelect[]>(["tasks", project_id], (old) => (old ? [...old, optimisticTask] : old));

      // Tanstack Optimistic UI for members
      const assigneeIds = taskFormData.assigneeIds as number[] | undefined;
      let previousTempMembers: UserSelect[] | undefined;

      if (assigneeIds?.length) {
        // Hydrate from cached project members
        const projectMembers = queryClient.getQueryData<UserSelect[]>(["project_members", project_id]) ?? [];
        const pmById = new Map(projectMembers.map((m) => [m.id, m]));
        const optimisticMembers = assigneeIds.map((id) => pmById.get(id)).filter(Boolean); // If a user isn't in cache, pmById.get(id) returns undefined. filter(Boolean) drops any undefineds.

        // snapshot existing (should be undefined)
        previousTempMembers = queryClient.getQueryData(["task_members", tempId]);

        // seed task_members for tempId
        queryClient.setQueryData(["task_members", tempId], optimisticMembers);
      }

      return { previousListTasks, previousProjectTasks, tempId, previousTempMembers, project_id, list_id, assigneeIds };
    },
    onSuccess: (createdTask, variables, context) => {
      toast.success("Success", { description: "Successfully created the task." });

      // We replace optimistic task with the tempId with the server-sourced task with actual id
      queryClient.setQueryData<TaskSelect[]>(
        ["tasks", list_id],
        (old) => old?.map((t) => (t.id === context.tempId ? createdTask : t)) ?? old,
      );

      queryClient.setQueryData<TaskSelect[]>(
        ["tasks", variables.project_id],
        (old) => old?.map((t) => (t.id === context!.tempId ? createdTask : t)) ?? old,
      );

      // We also transfer our assignees from task_members entry with temp id to task_members entry with actual id
      const tempMembers = queryClient.getQueryData<UserSelect[]>(["task_members", context!.tempId]) ?? [];
      if (tempMembers.length) {
        queryClient.setQueryData(["task_members", createdTask.id], tempMembers);
        // Then just remove the old query
        queryClient.removeQueries({ queryKey: ["task_members", context!.tempId], exact: true });
      }
      // Then invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ["task_members", createdTask.id] });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });

      // Rollback
      queryClient.setQueryData(["tasks", list_id], context?.previousListTasks);
      queryClient.setQueryData(["tasks", project_id], context?.previousProjectTasks);

      // Rollback for optimistic ui members
      if (context?.previousTempMembers !== undefined) {
        queryClient.setQueryData(["task_members", context.tempId], context.previousTempMembers);
      } else {
        queryClient.removeQueries({ queryKey: ["task_members", context!.tempId], exact: true });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", list_id] });
      queryClient.invalidateQueries({ queryKey: ["tasks", project_id] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async ({ task_id, project_id }: { task_id: number; project_id: number }) => {
      const res = await deleteTaskAction(task_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ task_id, project_id }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", list_id] });
      await queryClient.cancelQueries({ queryKey: ["tasks", project_id] });

      const previousListTasks = queryClient.getQueryData<TaskSelect[]>(["tasks", list_id]);
      const previousProjectTasks = queryClient.getQueryData<TaskSelect[]>(["tasks", project_id]);

      queryClient.setQueryData<TaskSelect[]>(["tasks", list_id], (old) =>
        old ? old.filter((t) => t.id != task_id) : old,
      );

      queryClient.setQueryData<TaskSelect[]>(["tasks", project_id], (old) =>
        old ? old.filter((t) => t.id != task_id) : old,
      );

      return { previousListTasks, previousProjectTasks };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully deleted the task." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["tasks", list_id], context?.previousListTasks);
      queryClient.setQueryData(["tasks", project_id], context?.previousProjectTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", list_id] });
      queryClient.invalidateQueries({ queryKey: ["tasks", project_id] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({
      task_id,
      project_id,
      taskFormData,
    }: {
      task_id: number;
      project_id: number;
      taskFormData?: z.infer<typeof taskSchemaForm>;
    }) => {
      const res = await updateTaskAction(task_id, taskFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ task_id, project_id, taskFormData }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", list_id] });
      await queryClient.cancelQueries({ queryKey: ["tasks", project_id] });

      const previousListTasks = queryClient.getQueryData<TaskSelect[]>(["tasks", list_id]);
      const previousProjectTasks = queryClient.getQueryData<TaskSelect[]>(["tasks", project_id]);

      // Optimistically update the task with the inputted taskFormData
      queryClient.setQueryData<TaskSelect[]>(["tasks", list_id], (old) =>
        old ? old.map((p) => (p.id === task_id ? (p = { ...p, ...taskFormData }) : p)) : old,
      );

      queryClient.setQueryData<TaskSelect[]>(["tasks", project_id], (old) =>
        old ? old.map((p) => (p.id === task_id ? (p = { ...p, ...taskFormData }) : p)) : old,
      );

      return { previousListTasks, previousProjectTasks };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully updated the task." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["tasks", list_id], context?.previousListTasks);
      queryClient.setQueryData(["tasks", project_id], context?.previousProjectTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", list_id] });
      queryClient.invalidateQueries({ queryKey: ["task_members", task_id] });
      queryClient.invalidateQueries({ queryKey: ["tasks", project_id] });
    },
  });

  const updateTaskNew = useMutation({
    mutationFn: async ({
      task_id,
      project_id,
      taskFormData,
    }: {
      task_id: number;
      project_id: number;
      taskFormData?: z.infer<typeof taskSchemaEditForm>;
    }) => {
      const res = await updateTaskNewAction(task_id, taskFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ task_id, project_id, taskFormData }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", list_id] });
      await queryClient.cancelQueries({ queryKey: ["tasks", project_id] });

      const previousListTasks = queryClient.getQueryData<TaskSelect[]>(["tasks", list_id]);
      const previousProjectTasks = queryClient.getQueryData<TaskSelect[]>(["tasks", project_id]);
      const previousActiveTask = useTaskStore.getState().activeTask;

      // React Query optimistic update
      const patch = (arr?: TaskSelect[]) =>
        arr ? arr.map((t) => (t.id === task_id ? { ...t, ...(taskFormData ?? {}) } : t)) : arr;

      // Optimistically update the task with the inputted taskFormData
      queryClient.setQueryData<TaskSelect[]>(["tasks", list_id], patch);
      queryClient.setQueryData<TaskSelect[]>(["tasks", project_id], patch);

      // Zustand optimistic update
      if (taskFormData && Object.keys(taskFormData).length > 0) {
        mergeActiveTask(taskFormData as Partial<TaskSelect>);
      }

      return { previousListTasks, previousProjectTasks, previousActiveTask };
    },
    onSuccess: () => {
      // toast.success("Success", { description: "Successfully updated the task." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      // React Query Rollback
      queryClient.setQueryData(["tasks", list_id], context?.previousListTasks);
      queryClient.setQueryData(["tasks", project_id], context?.previousProjectTasks);

      // Zustand Rollback
      if (context?.previousActiveTask) setActiveTask(context?.previousActiveTask);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", list_id] });
      queryClient.invalidateQueries({ queryKey: ["task_members", task_id] });
      queryClient.invalidateQueries({ queryKey: ["tasks", project_id] });
    },
  });

  const updateTasksPositions = useMutation({
    mutationFn: async ({ tasksPayload, project_id }: { tasksPayload: TaskPositionPayload[]; project_id: number }) => {
      const res = await updateTasksPositionsAction(tasksPayload, project_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ tasksPayload, project_id }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", list_id] });
      await queryClient.cancelQueries({ queryKey: ["tasks", project_id] });

      const previousListTasks = queryClient.getQueryData<TaskSelect[]>(["tasks", list_id]);
      const previousProjectTasks = queryClient.getQueryData<TaskSelect[]>(["tasks", project_id]);

      // Optimistically update the task with the new positions
      queryClient.setQueryData<TaskSelect[]>(["tasks", list_id], (old) =>
        old
          ? old.map((t) => {
              const payload = tasksPayload.find((p) => p.id === t.id);
              return payload
                ? {
                    ...t,
                    position: payload.position,
                  }
                : t;
            })
          : old,
      );

      queryClient.setQueryData<TaskSelect[]>(["tasks", project_id], (old) =>
        old
          ? old.map((t) => {
              const payload = tasksPayload.find((p) => p.id === t.id);
              return payload
                ? {
                    ...t,
                    position: payload.position,
                  }
                : t;
            })
          : old,
      );

      return { previousListTasks, previousProjectTasks };
    },
    onSuccess: () => {
      // toast.success("Success", { description: "Successfully updated the task positions." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["tasks", list_id], context?.previousListTasks);
      queryClient.setQueryData(["tasks", project_id], context?.previousProjectTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", list_id] });
      queryClient.invalidateQueries({ queryKey: ["tasks", project_id] });
    },
  });

  return {
    // Get Project's tasks
    projectTasks: getTaskByProject.data,
    isProjectTasksLoading: getTaskByProject.isPending,
    getProjectTasksError: getTaskByProject.error,

    // Get list's tasks
    listTasks: getTaskByListId.data,
    isListTasksLoading: getTaskByListId.isPending,
    getListTasksError: getTaskByListId.error,

    // Get members assigned to task
    taskMembers: getTaskMembers.data,
    isTaskMembersLoading: getTaskMembers.isLoading,
    getTaskMembersError: getTaskMembers.isError,

    // Task by Id
    task: getTaskById.data,
    isTaskLoading: getTaskById.isLoading,
    taskError: getTaskById.error,

    // Get task status
    taskStatus: getTaskStatus.data,
    isTaskStatusLoading: getTaskStatus.isLoading,
    taskStatusError: getTaskStatus.error,

    // Create task
    createTask: createTask.mutate,
    isCreateTaskLoading: createTask.isPending,
    createTaskError: createTask.error,

    // Delete Task
    deleteTask: deleteTask.mutate,
    isDeleteTaskLoading: deleteTask.isPending,
    deleteTaskError: deleteTask.error,

    // Update Task (Old Modal)
    updateTask: updateTask.mutate,
    isUpdateTaskLoading: updateTask.isPending,
    updateTaskError: updateTask.error,

    // Update Task (Notion/Github Style)
    updateTaskNew: updateTaskNew.mutateAsync,
    isUpdateTaskNewLoading: updateTaskNew.isPending,
    updateTaskNewError: updateTaskNew.error,

    // Update Task Positions
    updateTasksPositions: updateTasksPositions.mutate,
    isUpdateTasksPositionsLoading: updateTasksPositions.isPending,
    updateTasksPositionsError: updateTasksPositions.error,
  };
}
