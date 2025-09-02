"use server";

import { TaskPositionPayload, TaskSelect, TaskStatus, UserSelect } from "@/types";
import { ServerActionResponse } from "./actions-types";
import { queries } from "@/lib/db/queries/queries";
import {
  idSchema,
  taskSchema,
  taskSchemaDB,
  taskSchemaEditForm,
  taskSchemaForm,
  tasksPositionsPayloadSchema,
} from "../lib/validations/validations";
import z from "zod";
import { checkAuthenticationStatus } from "./actions-utils";
import { failResponse } from "@/lib/db/queries/query_utils";
import { getUserId } from "./user-actions";
import { guardProjectAction, guardTaskAction } from "@/lib/rbac/permission-utils";

// Fetches
export async function getTaskMembersAction(task_id: number): Promise<ServerActionResponse<UserSelect[]>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardTaskAction<UserSelect[]>({
    actorUserId: userRes.data.id,
    taskId: task_id,
    action: "READ",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: task_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.getTaskMembers(task_id);
}

export async function getTasksCountForProjectAction(project_id: number): Promise<ServerActionResponse<number>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardProjectAction<number>({
    actorUserId: userRes.data.id,
    projectId: project_id,
    action: "READ",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: project_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.getTasksCountForProject(project_id);
}

export async function getTasksByProjectAction(project_id: number): Promise<ServerActionResponse<TaskSelect[]>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardProjectAction<TaskSelect[]>({
    actorUserId: userRes.data.id,
    projectId: project_id,
    action: "READ",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: project_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.getByProject(project_id);
}

export async function getTasksByListIdAction(list_id: number): Promise<ServerActionResponse<TaskSelect[]>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardTaskAction<TaskSelect[]>({
    actorUserId: userRes.data.id,
    listId: list_id,
    action: "READ",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: list_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.getByList(list_id);
}

export async function getTaskByIdAction(task_id: number): Promise<ServerActionResponse<TaskSelect>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardTaskAction<TaskSelect>({
    actorUserId: userRes.data.id,
    taskId: task_id,
    action: "READ",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: task_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.getById(task_id);
}

export async function getProjectIdentifier(task_id: number): Promise<ServerActionResponse<number>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardTaskAction<number>({
    actorUserId: userRes.data.id,
    taskId: task_id,
    action: "READ",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: task_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.getProjectIdentifier(task_id);
}

export async function getTaskStatusAction(task_id: number): Promise<ServerActionResponse<TaskStatus>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardTaskAction<TaskStatus>({
    actorUserId: userRes.data.id,
    taskId: task_id,
    action: "READ",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: task_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.getTaskStatus(task_id);
}

export async function getTaskCreatorAction(task_id: number): Promise<ServerActionResponse<UserSelect>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardTaskAction<UserSelect>({
    actorUserId: userRes.data.id,
    taskId: task_id,
    action: "READ",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: task_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.getTaskCreator(task_id);
}

// Mutations
export async function deleteTaskAction(task_id: number): Promise<ServerActionResponse<TaskSelect>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardTaskAction<TaskSelect>({
    actorUserId: userRes.data.id,
    taskId: task_id,
    action: "DELETE",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: task_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.delete(task_id);
}

export async function createTaskAction(
  list_id: number,
  position: number,
  taskFormData: z.infer<typeof taskSchemaForm>,
): Promise<ServerActionResponse<TaskSelect>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardTaskAction<TaskSelect>({
    actorUserId: userRes.data.id,
    listId: list_id,
    action: "CREATE",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const res = await getUserId();
  if (!res.success) return res;

  const taskDBData: z.infer<typeof taskSchemaDB> = {
    ...taskFormData,
    listId: list_id,
    creatorId: res.data.id,
    position: position,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Zod strips unknown keys.
  const parsed = taskSchemaDB.safeParse(taskDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const assignedIds = taskFormData.assigneeIds;

  return await queries.tasks.create(taskDBData, assignedIds);
}

export async function updateTaskAction(
  task_id: number,
  taskFormData?: z.infer<typeof taskSchemaForm>,
): Promise<ServerActionResponse<TaskSelect>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardTaskAction<TaskSelect>({
    actorUserId: userRes.data.id,
    taskId: task_id,
    action: "UPDATE",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const res = await queries.tasks.getById(task_id);
  if (!res.success) return res;

  const taskDBData: z.infer<typeof taskSchema> = {
    ...res.data,
    ...taskFormData,
  };

  const parsed = taskSchema.safeParse(taskDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const assignedIds = taskFormData ? taskFormData.assigneeIds : null;

  return await queries.tasks.update(task_id, taskDBData, assignedIds);
}

export async function updateTaskNewAction(
  task_id: number,
  taskFormData?: z.infer<typeof taskSchemaEditForm>,
): Promise<ServerActionResponse<TaskSelect>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardTaskAction<TaskSelect>({
    actorUserId: userRes.data.id,
    taskId: task_id,
    action: "UPDATE",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const res = await queries.tasks.getById(task_id);
  if (!res.success) return res;

  const taskDBData: z.infer<typeof taskSchema> = {
    ...res.data,
    ...taskFormData,
  };

  const parsed = taskSchema.safeParse(taskDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const assignedIds = taskFormData?.assigneeIds ? taskFormData.assigneeIds : null;

  return await queries.tasks.update(task_id, taskDBData, assignedIds);
}

export async function updateTasksPositionsAction(
  tasksPayload: TaskPositionPayload[],
  project_id: number,
): Promise<ServerActionResponse<TaskSelect[]>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardTaskAction<TaskSelect[]>({
    actorUserId: userRes.data.id,
    projectId: project_id,
    action: "MOVE",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION

  const parsed = tasksPositionsPayloadSchema.safeParse(tasksPayload);

  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const parsedId = idSchema.safeParse({ id: project_id });
  if (!parsedId.success) return failResponse(`Zod Validation Error`, z.flattenError(parsedId.error));

  return await queries.tasks.updateTasksPositions(tasksPayload, project_id);
}
