"use server";
import { ListPositionPayload, ListSelect, ListsReorderedEvent } from "@/types";
import { ServerActionResponse } from "./actions-types";
import { queries } from "@/lib/db/queries/queries";
import { idSchema, listSchemaDB, listSchemaForm, listsPositionsPayloadSchema } from "@/lib/validations/validations";
import z from "zod";
import { checkAuthenticationStatus } from "./actions-utils";
import { failResponse } from "@/lib/db/queries/query_utils";
import { getUserId } from "./user-actions";
import { guardListAction } from "@/lib/rbac/permission-utils";
import { pusherServer } from "@/lib/pusher/pusher-server";

// Fetches
export async function getAllListsAction(project_id: number): Promise<ServerActionResponse<ListSelect[]>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardListAction<ListSelect[]>({
    actorUserId: userRes.data.id,
    projectId: project_id,
    action: "READ",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: project_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.lists.getByProject(project_id);
}

// Mutations
export async function createListAction(
  project_id: number,
  position: number,
): Promise<ServerActionResponse<ListSelect>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardListAction<ListSelect>({
    actorUserId: userRes.data.id,
    projectId: project_id,
    action: "CREATE",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const listDBData: z.infer<typeof listSchemaDB> = {
    name: "New Board",
    projectId: project_id,
    description: "A New Board",
    color: "GRAY",
    position: position,
    isDone: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const parsed = listSchemaDB.safeParse(listDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.lists.create(listDBData);
}

export async function updateListAction(
  list_id: number,
  listFormData: z.infer<typeof listSchemaForm>,
): Promise<ServerActionResponse<ListSelect>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  // Check if exists
  const res = await queries.lists.getById(list_id);
  if (!res.success) return res;

  const guardResult = await guardListAction<ListSelect>({
    actorUserId: userRes.data.id,
    projectId: res.data.projectId,
    action: "UPDATE",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const listDBData: z.infer<typeof listSchemaDB> = {
    ...res.data,
    name: listFormData.name,
    description: listFormData.description,
    color: listFormData.color,
  };

  const parsed = listSchemaDB.safeParse(listDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.lists.update(list_id, listDBData);
}

export async function deleteListAction(list_id: number): Promise<ServerActionResponse<ListSelect>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  // Check if exists
  const res = await queries.lists.getById(list_id);
  if (!res.success) return res;

  const guardResult = await guardListAction<ListSelect>({
    actorUserId: userRes.data.id,
    projectId: res.data.projectId,
    action: "DELETE",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: list_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));
  return await queries.lists.delete(list_id);
}

export async function updateListsPositionsAction(
  listsPayload: ListPositionPayload[],
  project_id: number,
): Promise<ServerActionResponse<ListSelect[]>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  const guardResult = await guardListAction<ListSelect[]>({
    actorUserId: userRes.data.id,
    projectId: project_id,
    action: "MOVE",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = listsPositionsPayloadSchema.safeParse(listsPayload);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const parsedId = idSchema.safeParse({ id: project_id });
  if (!parsedId.success) return failResponse(`Zod Validation Error`, z.flattenError(parsedId.error));

  const result = await queries.lists.updateListsPositions(listsPayload, project_id);
  if (!result.success) return result;

  // PUSHER BROADCAST
  try {
    // Sort ascending
    const reorderedListIds = [...listsPayload].sort((a, b) => a.position - b.position).map((l) => l.id);

    const payload: ListsReorderedEvent = {
      actorClerkId: userRes.data.clerkId,
      projectId: project_id,
      reorderedListIds,
    };

    await pusherServer.trigger(`presence-project-${project_id}`, "lists:reordered", payload);
  } catch (err) {
    console.error("PUSHER ERROR: List Movement Broadcast failed.", err);
  }

  return result;
}

export async function updateListsStatusAction(new_done_list_id: number): Promise<ServerActionResponse<ListSelect>> {
  // AUTH CHECK
  await checkAuthenticationStatus();

  // PERMISSION CHECK
  const userRes = await getUserId();
  if (!userRes.success) return userRes;

  // Check if exists
  const res = await queries.lists.getById(new_done_list_id);
  if (!res.success) return res;

  const guardResult = await guardListAction<ListSelect>({
    actorUserId: userRes.data.id,
    projectId: res.data.projectId,
    action: "UPDATE",
  });
  if (guardResult) return guardResult;

  // ZOD VALIDATION
  const parsed = idSchema.safeParse({ id: new_done_list_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.lists.updateListsDoneStatus(new_done_list_id);
}
